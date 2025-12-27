import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

    // Find shifts for tomorrow
    const { data: shifts } = await supabase
      .from("shift_assignments")
      .select(`
        id,
        user_id,
        sub_shifts(
          role_name,
          start_time,
          events(title)
        )
      `)
      .gte("sub_shifts.start_time", tomorrowStart.toISOString())
      .lte("sub_shifts.start_time", tomorrowEnd.toISOString())
      .eq("status", "confirmed");

    if (!shifts || shifts.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    // Get push subscriptions
    const { data: subscriptions } = await supabase
      .from("user_preferences")
      .select("user_id, push_subscription")
      .eq("push_notifications_enabled", true)
      .not("push_subscription", "is", null);

    if (!subscriptions) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    // Send notifications using Web Push API
    const vapidPublicKey = Deno.env.get("NEXT_PUBLIC_VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const vapidSubject = Deno.env.get("VAPID_SUBJECT")!;

    let sent = 0;

    for (const sub of subscriptions) {
      const userShifts = shifts.filter((s) => s.user_id === sub.user_id);
      
      for (const shift of userShifts) {
        try {
          const eventTitle = shift.sub_shifts?.events?.title || "Shift";
          const role = shift.sub_shifts?.role_name || "Unknown role";
          const startTime = new Date(
            shift.sub_shifts?.start_time
          ).toLocaleTimeString();

          // Use fetch to send via Web Push API
          const response = await fetch(
            "https://fcm.googleapis.com/fcm/send", // Or your push service endpoint
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                subscription: sub.push_subscription,
                payload: {
                  title: "Shift Reminder",
                  body: `You have a shift tomorrow: ${role} at ${startTime}`,
                  tag: `shift-${shift.id}`,
                  data: { url: "/volunteer" },
                },
              }),
            }
          );

          if (response.ok) sent++;
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      }
    }

    return new Response(JSON.stringify({ sent, total: shifts.length }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});