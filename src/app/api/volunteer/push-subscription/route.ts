import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { subscription, enabled } = await request.json();

    const supabase = createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Store push subscription in user_preferences
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          push_subscription: enabled ? subscription : null,
          push_notifications_enabled: enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: enabled
          ? "Push notifications enabled"
          : "Push notifications disabled",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling push subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user preferences
    const { data, error } = await supabase
      .from("user_preferences")
      .select("push_subscription, push_notifications_enabled")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // User preferences might not exist yet - that's ok
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            push_subscription: null,
            push_notifications_enabled: false,
          },
          { status: 200 }
        );
      }
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to retrieve subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        push_subscription: data?.push_subscription || null,
        push_notifications_enabled: data?.push_notifications_enabled || false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching push subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
