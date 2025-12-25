import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin() {
  const supabase = createServerSupabaseClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, status: 401, error: "Unauthorized", user: null } as const;
  }
  const user = userData.user;
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profErr || !profile || !["admin", "super_admin"].includes(profile.role)) {
    return { ok: false, status: 403, error: "Forbidden", user: null } as const;
  }
  return { ok: true, user, role: profile.role } as const;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const admin = adminClient();
    const volunteerId = params.id;

    // Fetch volunteer profile
    const { data: profile, error: profErr } = await admin
      .from("profiles")
      .select("id, full_name, role, phone_number")
      .eq("id", volunteerId)
      .single();
    if (profErr || !profile) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    // Get email separately from auth table
    const { data: { users }, error: authErr } = await admin.auth.admin.listUsers();
    const authUser = users?.find((u: any) => u.id === volunteerId);
    const email = authUser?.email ?? "";

    // Fetch all assignments with event details
    const { data: assignments, error: assignErr } = await admin
      .from("shift_assignments")
      .select(
        "id, status, created_at, sub_shifts!inner(id, role_name, start_time, end_time, events!inner(id, title, start_time))"
      )
      .eq("user_id", volunteerId)
      .order("created_at", { ascending: false });
    if (assignErr) throw assignErr;

    // Map assignments with event info
    const mapped_assignments = (assignments ?? []).map((a: any) => {
      const sub = Array.isArray(a.sub_shifts) ? a.sub_shifts[0] : a.sub_shifts;
      const evt = Array.isArray(sub?.events) ? sub?.events[0] : sub?.events;
      return {
        id: a.id,
        status: a.status,
        created_at: a.created_at,
        role_name: sub?.role_name ?? "",
        start_time: sub?.start_time ?? evt?.start_time,
        end_time: sub?.end_time,
        event_title: evt?.title ?? "",
        event_id: evt?.id,
      };
    });

    // Separate upcoming and past assignments
    const now = new Date();
    const upcoming = mapped_assignments.filter(a => new Date(a.start_time) > now);
    const past = mapped_assignments.filter(a => new Date(a.start_time) <= now);

    return NextResponse.json({
      id: profile.id,
      full_name: profile.full_name || "Unknown",
      email: email,
      phone_number: profile.phone_number || null,
      role: profile.role,
      upcoming,
      past,
      assignment_count: mapped_assignments.length,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed to fetch volunteer details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { action } = await request.json();
    const userId = params.id;

    if (action === "promote") {
      // Promote volunteer to admin
      const admin = adminClient();
      
      // Check target user role
      const { data: profile, error: fetchErr } = await admin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      if (fetchErr || !profile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (profile.role !== "volunteer") {
        return NextResponse.json(
          { error: "Can only promote volunteers to admin" },
          { status: 400 }
        );
      }

      // Update role to admin
      const { error: updateErr } = await admin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId);
      if (updateErr) throw updateErr;

      return NextResponse.json({ success: true, message: "User promoted to admin" });
    }

    if (action === "delete") {
      // Delete user account
      const admin = adminClient();

      // Check target user role - cannot delete other managers
      const { data: profile, error: fetchErr } = await admin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      if (fetchErr || !profile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (profile.role !== "volunteer") {
        return NextResponse.json(
          { error: "Cannot delete manager accounts" },
          { status: 403 }
        );
      }

      // Delete from auth
      const { error: deleteAuthErr } = await admin.auth.admin.deleteUser(userId);
      if (deleteAuthErr) throw deleteAuthErr;

      // Delete profile (cascade will handle assignments)
      const { error: deleteProfileErr } = await admin
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (deleteProfileErr) throw deleteProfileErr;

      return NextResponse.json({ success: true, message: "User account deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed to update user" },
      { status: 500 }
    );
  }
}
