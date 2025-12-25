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
    return { ok: false, status: 401, error: "Unauthorized", user: null, role: null } as const;
  }
  const user = userData.user;
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profErr || !profile || !["admin", "super_admin"].includes(profile.role)) {
    return { ok: false, status: 403, error: "Forbidden", user: null, role: null } as const;
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
    
    // Get profiles from database
    const { data: profiles, error: profError } = await admin
      .from("profiles")
      .select("id, full_name, role");
    if (profError) throw profError;

    // Get email addresses from auth.users
    const { data: authUsers, error: authError } = await admin.auth.admin.listUsers();
    if (authError) throw authError;

    const emailMap = new Map(authUsers.users.map((u: any) => [u.id, u.email]));

    const mapped = (profiles ?? []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      email: emailMap.get(p.id) ?? null,
    }));
    return NextResponse.json(mapped);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id, role } = await request.json();
    if (!id || !role) {
      return NextResponse.json({ error: "Missing id or role" }, { status: 400 });
    }

    if (!["admin", "super_admin", "volunteer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const admin = adminClient();

    // Fetch the target user's current role
    const { data: targetProfile, error: fetchErr } = await admin
      .from("profiles")
      .select("role")
      .eq("id", id)
      .single();
    if (fetchErr || !targetProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only super_admin can modify super_admin role or demote super_admin
    if (targetProfile.role === "super_admin" || role === "super_admin") {
      if (auth.role !== "super_admin") {
        return NextResponse.json({ error: "Only super_admin can modify super_admin role" }, { status: 403 });
      }
    }

    const { error } = await admin.from("profiles").update({ role }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to update role" }, { status: 500 });
  }
}
