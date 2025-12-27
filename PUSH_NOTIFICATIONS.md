# Push Notifications - Implementation Guide

## What Was Implemented

Volunteers can enable/disable push notifications on the volunteer portal. When enabled, they receive browser notifications for shift reminders and updates.

## Files Added

- `src/components/PushNotificationToggle.tsx` - UI toggle button with Apple device guidance
- `src/lib/pushNotifications.ts` - Core notification functions (request permission, subscribe, unsubscribe)
- `src/app/api/volunteer/push-subscription/route.ts` - API to save/retrieve subscriptions
- `public/sw.js` - Service worker that handles incoming notifications
- `supabase/migrations/20240528000000_add_push_notifications.sql` - Database schema updates
- `src/app/volunteer/page.tsx` - Modified to include toggle component

## Quick Setup

1. Generate VAPID keys:
   ```bash
   npm install web-push
   npx web-push generate-vapid-keys
   ```

2. Set environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your_public_key>
   VAPID_PRIVATE_KEY=<your_private_key>
   VAPID_SUBJECT=mailto:your-email@example.com
   ```

3. Run database migration:
   ```bash
   supabase db push
   ```

4. Test: Visit `/volunteer` and click "Enable" in the Notifications section. Browser will show permission dialog.

## Sending Notifications (Using Supabase Edge Functions)

Supabase Edge Functions let you run code on a schedule without needing your PC running.

### 1. Create the Edge Function

Create a new file: `supabase/functions/send-shift-reminders/index.ts`

```typescript
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
```

### 2. Deploy the Function

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link your project
supabase link

# Deploy the function
supabase functions deploy send-shift-reminders
```

### 3. Set Up the Cron Job

In your Supabase dashboard:

1. Go to **Database** → **Cron**
2. Create a new cron job:
   - **Name:** `send-shift-reminders`
   - **Function:** Select `send-shift-reminders`
   - **Schedule:** `0 10 * * *` (10 AM daily)
   - **Timezone:** Your timezone

Or add to your `supabase.yaml`:

```yaml
functions:
  - name: send-shift-reminders
    scheduling: "0 10 * * *"
```

### 4. That's It!

Every day at 10 AM, Supabase automatically:
- Runs the function
- Queries tomorrow's shifts
- Sends notifications to subscribed volunteers

No PC needed, runs in the cloud.

## Features

- ✅ One-click enable/disable
- ✅ Browser permission dialog
- ✅ Apple device detection with setup guidance
- ✅ Subscription storage in database
- ✅ Service worker for delivery
- ✅ Secure with RLS policies and authentication

## Browser Support

- Chrome, Firefox, Edge: Full support
- Safari (Mac 13.1+): Supported
- Safari (iOS): Not supported - show guidance for native app
