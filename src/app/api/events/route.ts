import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createAdminClient(url, key);
}

async function requireAdmin() {
  const supabase = createServerSupabaseClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }
  const user = userData.user;
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profErr || !profile || !["admin", "super_admin"].includes(profile.role)) {
    return { ok: false, status: 403, error: "Forbidden" } as const;
  }
  return { ok: true } as const;
}

export async function GET() {
  try {
    const admin = getAdmin();
    const { data: events, error: evErr } = await admin
      .from("events")
      .select("id,title,start_time,end_time,location,sub_shifts(id,role_name,start_time,end_time,capacity)")
      .order("start_time", { ascending: true });
    if (evErr) throw evErr;

    const eventIds = (events ?? []).map((e: any) => e.id);
    let capacities: Record<string, number> = {};
    let filledByEvent: Record<string, number> = {};
    let filledBySubShift: Record<string, number> = {};

    if (eventIds.length) {
      const { data: subShifts } = await admin
        .from("sub_shifts")
        .select("id,event_id,capacity").in("event_id", eventIds);
      const byEvent: Record<string, { subShiftIds: string[]; capacity: number }> = {};
      (subShifts ?? []).forEach((s: any) => {
        const ev = s.event_id;
        byEvent[ev] ??= { subShiftIds: [], capacity: 0 };
        byEvent[ev].capacity += s.capacity ?? 0;
        byEvent[ev].subShiftIds.push(s.id);
      });
      capacities = Object.fromEntries(Object.entries(byEvent).map(([k, v]) => [k, v.capacity]));

      const allSubShiftIds = (subShifts ?? []).map((s: any) => s.id);
      if (allSubShiftIds.length) {
        const { data: assignments } = await admin
          .from("shift_assignments")
          .select("id,sub_shift_id").in("sub_shift_id", allSubShiftIds);
        (assignments ?? []).forEach((a: any) => {
          filledBySubShift[a.sub_shift_id] = (filledBySubShift[a.sub_shift_id] ?? 0) + 1;
        });
        filledByEvent = Object.fromEntries(
          Object.entries(byEvent).map(([eventId, v]) => {
            const total = v.subShiftIds.reduce((acc, id) => acc + (filledBySubShift[id] ?? 0), 0);
            return [eventId, total];
          })
        );
      }
    }

    const payload = (events ?? []).map((e: any) => {
      const subShifts = (e.sub_shifts ?? [])
        .sort((a: any, b: any) => {
          // Sort by start_time, then by end_time (for consistent ordering of overlapping shifts)
          const aStart = a.start_time || "";
          const bStart = b.start_time || "";
          const startCompare = aStart.localeCompare(bStart);
          if (startCompare !== 0) return startCompare;
          const aEnd = a.end_time || "";
          const bEnd = b.end_time || "";
          return aEnd.localeCompare(bEnd);
        })
        .map((s: any) => ({
        ...s,
        filled: filledBySubShift[s.id] ?? 0,
        available: Math.max((s.capacity ?? 0) - (filledBySubShift[s.id] ?? 0), 0),
      }));
      const capacity = subShifts.reduce((acc: number, s: any) => acc + (s.capacity ?? 0), 0);
      const filled = subShifts.reduce((acc: number, s: any) => acc + (filledBySubShift[s.id] ?? 0), 0);
      return {
        ...e,
        sub_shifts: subShifts,
        capacity: capacity || capacities[e.id] || 0,
        filled: filled || filledByEvent[e.id] || 0,
      };
    });
    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { title, start_time, end_time, sub_shifts } = body;
    if (!title || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const admin = getAdmin();
    const { data: ev, error: evErr } = await admin
      .from("events")
      .insert({ title, start_time, end_time })
      .select("id,title,start_time,end_time")
      .single();
    if (evErr) throw evErr;

    let capacityTotal = 0;
    if (Array.isArray(sub_shifts) && sub_shifts.length) {
      const rows = sub_shifts.map((s: any) => ({
        event_id: ev.id,
        role_name: s.role_name,
        start_time: s.start_time,
        end_time: s.end_time,
        capacity: s.capacity ?? 1,
      }));
      const { error: ssErr } = await admin.from("sub_shifts").insert(rows);
      if (ssErr) throw ssErr;
      capacityTotal = rows.reduce((acc, r) => acc + (r.capacity ?? 0), 0);
    }

    return NextResponse.json({ ...ev, capacity: capacityTotal });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to create" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, title, start_time, end_time, sub_shifts, force } = body as {
      id: string;
      title: string;
      start_time: string;
      end_time: string;
      sub_shifts?: Array<{ id?: string; role_name: string; start_time: string; end_time: string; capacity?: number }>;
      force?: boolean;
    };
    if (!id || !title || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const admin = getAdmin();
    const { error: evErr } = await admin
      .from("events")
      .update({ title, start_time, end_time })
      .eq("id", id);
    if (evErr) throw evErr;

    // Only re-process sub_shifts if they were explicitly provided in the request
    if (Array.isArray(sub_shifts)) {
      // Fetch existing sub_shifts
      const { data: existingSubShifts, error: fetchErr } = await admin
        .from("sub_shifts")
        .select("id,role_name,start_time,end_time,capacity")
        .eq("event_id", id);
      if (fetchErr) throw fetchErr;

      const existingById = new Map<string, any>();
      (existingSubShifts ?? []).forEach((s) => existingById.set(s.id, s));

      const payloadIds = new Set<string>();

      // First, update by id when provided (preserves assignments even if times/role change)
      for (const s of sub_shifts) {
        if (s.id) {
          payloadIds.add(s.id);
          const { error: upErr } = await admin
            .from("sub_shifts")
            .update({
              role_name: s.role_name,
              start_time: s.start_time,
              end_time: s.end_time,
              capacity: s.capacity ?? 1,
            })
            .eq("id", s.id);
          if (upErr) throw upErr;
        }
      }

      // For items without id: try matching by role/time, else insert new
      const existingByKey = new Map<string, any>();
      (existingSubShifts ?? []).forEach((s) => {
        existingByKey.set(`${s.role_name}|${s.start_time}|${s.end_time}`, s);
      });

      for (const s of sub_shifts) {
        if (!s.id) {
          const key = `${s.role_name}|${s.start_time}|${s.end_time}`;
          const existing = existingByKey.get(key);
          if (existing) {
            payloadIds.add(existing.id);
            if (existing.capacity !== (s.capacity ?? 1)) {
              const { error: upErr } = await admin
                .from("sub_shifts")
                .update({ capacity: s.capacity ?? 1 })
                .eq("id", existing.id);
              if (upErr) throw upErr;
            }
          } else {
            const { data: inserted, error: insErr } = await admin
              .from("sub_shifts")
              .insert({
                event_id: id,
                role_name: s.role_name,
                start_time: s.start_time,
                end_time: s.end_time,
                capacity: s.capacity ?? 1,
              })
              .select("id")
              .single();
            if (insErr) throw insErr;
            if (inserted?.id) payloadIds.add(inserted.id);
          }
        }
      }

      // Determine deletions: existing ids not present in payloadIds
      const idsToDelete = (existingSubShifts ?? [])
        .map((s) => s.id)
        .filter((eid) => !payloadIds.has(eid));

      if (idsToDelete.length > 0) {
        const { data: assigned, error: assignCheckErr } = await admin
          .from("shift_assignments")
          .select("id, sub_shift_id")
          .in("sub_shift_id", idsToDelete);
        if (assignCheckErr) throw assignCheckErr;

        const assignedMap: Record<string, number> = {};
        (assigned ?? []).forEach((a: any) => {
          assignedMap[a.sub_shift_id] = (assignedMap[a.sub_shift_id] ?? 0) + 1;
        });

        const hasAssigned = Object.keys(assignedMap).length > 0;
        if (hasAssigned && !force) {
          return NextResponse.json(
            {
              error: "One or more sub-shifts have assigned volunteers. Confirm deletion to proceed.",
              assigned_sub_shifts: Object.keys(assignedMap),
              counts: assignedMap,
            },
            { status: 409 }
          );
        }

        const { error: delErr } = await admin
          .from("sub_shifts")
          .delete()
          .in("id", idsToDelete);
        if (delErr) throw delErr;
      }
    }
    // If sub_shifts is not provided, leave existing ones alone

    return NextResponse.json({ id, title, start_time, end_time, capacity: 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const admin = getAdmin();
    const { error } = await admin.from("events").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to delete" }, { status: 500 });
  }
}
