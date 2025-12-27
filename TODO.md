# VolunTy - TODO List

*Last updated: December 27, 2025*

---

## 🔴 High Priority Issues

- All high-priority items resolved on Dec 27, 2025

### ✅ Database Migration Documentation Updated
**Status:** Completed (Dec 27, 2025)  

- Deployment guide now points to `20240522000000_initial_setup.sql` and `20240523000000_functions_and_triggers.sql` with correct execution order

### ✅ Debug Endpoint Locked Down
**Status:** Completed (Dec 27, 2025)  

- Added admin-only guard to the debug auth endpoint to prevent unauthenticated access

---

**Files:** [`src/components/AdminSchedule.tsx`](src/components/AdminSchedule.tsx)

- Removed unused `AdminCalendar.tsx`; admin events page remains on tailored `AdminSchedule`

### ✅ Admin Role Management Component Removed
### ✅ SuperadminTransfer Integrated
### 11. Settings Persistence Issues
**Status:** Needs investigation  
**Files:** [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx), [`src/app/api/settings/route.ts`](src/app/api/settings/route.ts)

- Several new settings controls report not working (org name, logo URL, self-signup, notifications, reminder hours, user preferences)
- Verify values persist and reload via `organization_settings` and `user_preferences`
- Check client save handlers, API upserts, and RLS behavior
- **Action needed:** Debug and fix non-working settings and preference saves
**Status:** Completed (Dec 27, 2025)  
**Files:** [`src/components/SuperadminTransfer.tsx`](src/components/SuperadminTransfer.tsx), [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx)

- Integrated floating Superadmin control into Admin Settings page
- Visible only to `super_admin` users (component self-gates by role)
- Fixed transfer flow: promote target first, then demote current user
- Uses existing `/api/auth/me` and `/api/admin/users` routes with proper auth checks

### ✅ Settings Expanded
**Status:** Completed (Dec 27, 2025)  
**Files:** [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx), [`src/app/api/settings/route.ts`](src/app/api/settings/route.ts)

- Added organization config: name, logo URL, allow self-signup, notifications enabled
- Added reminder timing config (hours before shift)
- Timezone selector retained
- Added user preferences UI: dark mode preference and email notifications (per-user)
- Org settings persisted via `organization_settings` keys; user prefs saved via Supabase RLS upsert

---

### ✅ Push Notifications System Implemented
**Status:** Completed (Dec 27, 2025)  
**Files:** [`src/lib/pushNotifications.ts`](src/lib/pushNotifications.ts), [`src/components/PushNotificationToggle.tsx`](src/components/PushNotificationToggle.tsx), [`src/app/api/volunteer/push-subscription/route.ts`](src/app/api/volunteer/push-subscription/route.ts), [`public/sw.js`](public/sw.js)

- Implemented browser push notification support
- Volunteers can enable/disable via toggle button on portal
- Shows system permission dialog when enabled
- Apple device detection with detailed guidance for iOS/Mac users
- Service worker handles notification delivery and clicks
- Subscription data stored in `user_preferences` table
- Database migration: `20240528000000_add_push_notifications.sql`

---

## 🔵 Low Priority / Future Features

### 7. Notification/Reminder System - Phase 2
**Status:** Partially implemented  
**Impact:** Core feature in progress

- ✅ Push notifications UI and storage ready
- README promises "Automatic Reminders 24h before shifts"
- README promises "48h unfilled slot alerts for admins"
- **Action needed:**
  1. Set up push service backend (e.g., Firebase Cloud Messaging, Web Push Library)
  2. Create scheduled function for reminder checks (Supabase Edge Functions or cron job)
  3. Implement notification sending logic for shift reminders
  4. Add admin notification for understaffed shifts

### 8. Database Features Not Implemented
**Status:** Schema exists, code missing

#### `audit_logs` table (exists, unused)
- Nothing writes to it
- No activity tracking anywhere
- **Action needed:** Add audit logging for critical actions (signup, swap, delete)

#### `checked_in_at` field (exists, unused)
- `shift_assignments.checked_in_at` is never set
- No check-in feature for volunteers
- **Action needed:** Add check-in functionality for event day

#### `min_needed` field (exists, unused)
- `sub_shifts.min_needed` is set but never checked
- No critical staffing alerts
- **Action needed:** Implement understaffing warnings

#### `is_published` field (exists, unused)
- `events.is_published` exists but all events are visible
- No draft mode for events
- **Action needed:** Add draft/publish workflow for events

### 9. Reporting is Missing
**Status:** Not implemented (README promises this)

- README promises "Download CSV/PDF reports of hours and shift history"
- No export functionality anywhere
- No reports or analytics pages
- **Action needed:**
  1. Create reports page
  2. Add CSV export for volunteer hours
  3. Add PDF generation for shift schedules
  4. Add analytics dashboard (optional)

### 10. Mobile Push Notifications
**Status:** Not implemented (README mentions this)

- README mentions "browser push notifications"
- No service worker implementation
- No push subscription handling
- **Action needed:** Implement Web Push API if desired

---

## 📊 Summary

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 High  | 0     | Resolved on Dec 27, 2025 |
| 🟡 Medium | 1    | Settings persistence investigation |
| 🔵 Low   | 4     | Future enhancements |
| **Total** | **5** | Open issues |

---

## Notes

- Several UI components exist but are not integrated (SuperadminTransfer)
- Notification system is a major promised feature that's completely missing
- Several database fields/tables exist but are unused (technical debt)
- Consider creating GitHub issues for tracking individual items

## Recent Changes (Dec 27, 2025)

- ✅ Deployment guide now references consolidated migrations (initial_setup + functions_and_triggers)
- ✅ Debug auth endpoint restricted to admin/super_admin
- ✅ Removed unused AdminCalendar; kept AdminSchedule as the events UI
- ✅ Removed redundant AdminRoles (role management is in AdminVolunteersList)
- ✅ Consolidated database migrations from 6 files into 2 comprehensive migration files
- ✅ Enhanced auth callback with better OAuth error handling and logging
- ✅ Added debug endpoint for authentication troubleshooting
- ✅ All high-priority security issues from Dec 24 have been completed (swap requests, auth enforcement, middleware protection, event editing safeguards)
- ✅ Admin volunteers view fully implemented with role management
- ✅ Integrated SuperadminTransfer into settings and fixed transfer order
