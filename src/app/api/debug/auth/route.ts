import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !["admin", "super_admin"].includes(profile.role)) {
    return { ok: false, status: 403, error: "Forbidden" } as const;
  }

  return { ok: true, user, role: profile.role } as const;
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, role, calendar_token")
      .limit(10);

    return NextResponse.json({
      status: "ok",
      currentUser: { user, error: userError?.message },
      profiles: { count: profiles?.length || 0, error: profilesError?.message },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
