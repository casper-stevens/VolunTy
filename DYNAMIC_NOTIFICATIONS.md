# Dynamic Notification Preferences Implementation

## What's Been Set Up

Users can now customize their shift reminder timing down to the **minute**, along with their timezone.

### New Components & Files

1. **Database Migration** (`/supabase/migrations/20250101000000_add_notification_preferences.sql`)
   - Creates `user_notification_preferences` table with:
     - `reminder_minutes_before`: How many minutes before shift to remind (customizable by minute)
     - `timezone`: User's timezone for accurate notification timing
     - `enabled`: Toggle notifications on/off

2. **Notification Preferences Modal** (`/src/components/NotificationPreferencesModal.tsx`)
   - Beautiful modal UI for users to set preferences
   - Preset buttons: 15 min, 30 min, 1 hour, 2 hours, 24 hours
   - Custom minute input for flexibility
   - Timezone selector (40+ timezones)
   - Settings button appears next to Enable/Disable toggle

3. **API Route** (`/src/app/api/volunteer/notification-preferences/route.ts`)
   - `GET`: Fetch user's current preferences
   - `POST`: Save/update preferences

4. **Updated PushNotificationToggle** (`/src/components/PushNotificationToggle.tsx`)
   - Added Settings gear icon button (appears when notifications enabled)
   - Opens preference modal on click

## How to Deploy

1. **Run the migration**:
   ```bash
   npm run supabase db push
   # or manually in Supabase SQL editor
   ```

2. **Rebuild**:
   ```bash
   npm run build
   ```

3. **Test**:
   - Go to `/volunteer`
   - Enable notifications
   - Click the Settings gear icon
   - Adjust reminder minutes and timezone

## Integration with Supabase Cron (For Admin)

Your cron function should now query user preferences and send notifications accordingly:

### Simple Setup: Use the Built-in API Endpoint

I've created an API endpoint that handles all the logic. Just call it from your cron:

**1. Set environment variable:**
```bash
CRON_SECRET_KEY=your-random-secret-key
```

**2. Call from Supabase Edge Function:**
```typescript
// supabase/functions/send-shift-reminders/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  try {
    const secretKey = Deno.env.get("CRON_SECRET_KEY");
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/api/volunteer/send-reminders?secret=${secretKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: response.status });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

**3. Deploy and schedule the function:**
```bash
# Deploy the function
supabase functions deploy send-shift-reminders

# Set the schedule (e.g., every hour at :00)
# In Supabase Dashboard: Functions → send-shift-reminders → Cron expression
# Use: 0 * * * * (every hour)
#   or: 0 0 * * * (daily at midnight)
```

**4. Test the endpoint:**
```bash
curl "https://your-domain.com/api/volunteer/send-reminders?secret=your-random-secret-key"
```

---

## What Happens When

### 1. **Shift is assigned** (Immediate)
- User signs up for a shift via `/volunteer` page
- API route triggers `sendShiftAssignmentNotification()`
- Push notification sent **immediately** if enabled
- Message: "New Shift Assigned! - [Event] [Role] on [Date]"

### 2. **Reminder time arrives** (Via Cron)
- Cron runs hourly/daily (your schedule)
- Checks all shifts with enabled notifications
- For each shift in the reminder window (e.g., 24 hours before), sends notification
- Message: "Shift Reminder - [Event] [Role] at [Time]"

---

### Advanced: Direct Implementation (Optional)

If you prefer not to use the API endpoint, use the helper directly in your cron:

```typescript
// supabase/functions/send-shift-reminders/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get all active users with notifications enabled
  const { data: prefs } = await supabase
    .from("user_notification_preferences")
    .select("user_id, reminder_minutes_before, timezone, enabled")
    .eq("enabled", true);

  if (!prefs || prefs.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  let sentCount = 0;

  // For each user
  for (const pref of prefs) {
    // Calculate when to send notification
    const nowInUserTz = new Date().toLocaleString("en-US", {
      timeZone: pref.timezone,
    });
    const reminderWindow = {
      start: new Date(
        new Date(nowInUserTz).getTime() + pref.reminder_minutes_before * 60000
      ),
      end: new Date(
        new Date(nowInUserTz).getTime() +
          (pref.reminder_minutes_before + 1) * 60000
      ),
    };

    // Find shifts in the notification window
    const { data: shifts } = await supabase
      .from("shift_assignments")
      .select(
        `
        id,
        user_id,
        sub_shifts!inner(
          id,
          role_name,
          start_time,
          end_time,
          events!inner(id, title)
        )
      `
      )
      .eq("user_id", pref.user_id)
      .eq("status", "confirmed")
      .gte("sub_shifts.start_time", reminderWindow.start.toISOString())
      .lte("sub_shifts.start_time", reminderWindow.end.toISOString());

    if (!shifts || shifts.length === 0) {
      continue;
    }

    // Send push notifications
    for (const shift of shifts) {
      const { data: subscriptions } = await supabase
        .from("user_preferences")
        .select("push_subscription")
        .eq("user_id", pref.user_id)
        .not("push_subscription", "is", null)
        .single();

      if (!subscriptions?.push_subscription) {
        continue;
      }

      try {
        // Use web-push to send notification
        const webpush = await import(
          "https://esm.sh/web-push@3.6.5"
        );
        
        webpush.setVapidDetails(
          Deno.env.get("VAPID_SUBJECT")!,
          Deno.env.get("NEXT_PUBLIC_VAPID_PUBLIC_KEY")!,
          Deno.env.get("VAPID_PRIVATE_KEY")!
        );

        await webpush.sendNotification(
          subscriptions.push_subscription,
          JSON.stringify({
            title: "Shift Reminder",
            body: `${shift.sub_shifts.events.title} - ${shift.sub_shifts.role_name}`,
            data: {
              url: "/volunteer",
            },
          })
        );

        sentCount++;
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  }

  return new Response(
    JSON.stringify({ sent: sentCount, timestamp: new Date() }),
    { status: 200 }
  );
});
```

### Running the Cron

1. **Create Edge Function** (if not already done):
   ```bash
   supabase functions new send-shift-reminders
   ```

2. **Add the code above to the function**

3. **Deploy**:
   ```bash
   supabase functions deploy send-shift-reminders \
     --project-ref YOUR_PROJECT_ID
   ```

4. **Set cron schedule in Supabase Dashboard**:
   - Go to Functions → send-shift-reminders
   - Set the cron expression:
     - `0 * * * *` = every hour
     - `0 0 * * *` = daily at midnight UTC
     - `*/15 * * * *` = every 15 minutes (more responsive)

## Testing the System

1. **Test shift assignment notification**:
   - As a volunteer, sign up for a shift
   - Should receive push notification immediately (if enabled)

2. **Test reminder notifications**:
   - Manual call to reminder endpoint:
   ```bash
   curl "http://localhost:3000/api/volunteer/send-reminders?secret=test-key"
   ```

3. **Check logs**:
   - Supabase Dashboard → Logs → Function invocations
   - Browser console for client-side notification logs

4. **Verify in database**:
   ```sql
   SELECT * FROM user_notification_preferences;
   SELECT * FROM user_preferences WHERE push_subscription IS NOT NULL;
   ```

## Files Added/Modified

**New Files:**
- `src/lib/notificationHelpers.ts` - Helper functions for sending notifications
- `src/app/api/volunteer/send-reminders/route.ts` - API endpoint for cron
- `supabase/migrations/20250101000000_add_notification_preferences.sql` - DB schema
- `src/components/NotificationPreferencesModal.tsx` - User settings UI
- `src/app/api/volunteer/notification-preferences/route.ts` - Preferences API

**Modified Files:**
- `src/components/PushNotificationToggle.tsx` - Added settings button
- `src/app/api/volunteer/assignments/route.ts` - Added notification trigger

## Features

✅ Users set reminder time in minutes (1-10080 mins = 1 min - 7 days)  
✅ Timezone-aware notifications  
✅ Settings accessible from volunteer dashboard  
✅ Preferences saved in database  
✅ Works with existing push notification infrastructure  
✅ No additional external dependencies needed  

## Next Steps (Optional)

- Add **recurring notification patterns** (daily, weekly, etc.)
- Add **quiet hours** (e.g., don't notify between 9pm-8am)
- **Notification history** page to see sent notifications
- **Smart scheduling** to avoid duplicate notifications
