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

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const admin = adminClient();
    
    // Fetch all users with their basic info
    const { data: profiles, error: profErr } = await admin
      .from("profiles")
      .select("id, full_name, role")
      .order("full_name", { ascending: true });
    if (profErr) throw profErr;

    // Get assignment counts per volunteer
    const volunteerIds = (profiles ?? []).map((p: any) => p.id);
    let assignmentCounts: Record<string, number> = {};
    let lastActive: Record<string, string> = {};

    if (volunteerIds.length > 0) {
      const { data: assignments, error: assignErr } = await admin
        .from("shift_assignments")
        .select("user_id, created_at")
        .in("user_id", volunteerIds);
      if (assignErr) throw assignErr;

      const countMap: Record<string, number> = {};
      const lastMap: Record<string, string> = {};
      (assignments ?? []).forEach((a: any) => {
        countMap[a.user_id] = (countMap[a.user_id] ?? 0) + 1;
        if (!lastMap[a.user_id] || new Date(a.created_at) > new Date(lastMap[a.user_id])) {
          lastMap[a.user_id] = a.created_at;
        }
      });
      assignmentCounts = countMap;
      lastActive = lastMap;
    }

    // Get email addresses from auth.users
    const { data: authUsers, error: authError } = await admin.auth.admin.listUsers();
    if (authError) throw authError;

    const emailMap = new Map(authUsers.users.map((u: any) => [u.id, u.email]));

    const mapped = (profiles ?? []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name || "Unknown",
      email: emailMap.get(p.id) ?? "",
      role: p.role,
      assignment_count: assignmentCounts[p.id] ?? 0,
      last_active: lastActive[p.id] ?? null,
    }));

    return NextResponse.json(mapped);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to fetch volunteers" }, { status: 500 });
  }
}
