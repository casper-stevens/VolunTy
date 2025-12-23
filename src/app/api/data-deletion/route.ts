import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();

    // SSR client with anon key to read current authenticated user from cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {
            // not needed in this route
          },
          remove() {
            // not needed in this route
          },
        },
      }
    );

    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError) {
      return NextResponse.json(
        { error: "Unable to verify user session" },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Use service role for privileged auth admin actions
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key not configured on server" },
        { status: 500 }
      );
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // Optionally capture reason from body for audit purposes
    const body = await request.json().catch(() => ({} as any));
    const reason: string | undefined = body?.reason;

    // Delete the auth user; cascades remove profile and related rows
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // Optionally write an audit log entry (if table exists and RLS allows service role)
    try {
      await admin
        .from("audit_logs")
        .insert({ action: "account_delete", performed_by: user.id, details: { reason } });
    } catch {
      // Ignore audit failure
    }

    // Success
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
