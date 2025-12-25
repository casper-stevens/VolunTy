# VolunTy - TODO List

*Last updated: December 24, 2025*

---

## 🔴 High Priority Issues

### 1. Admin Swap Request Handling is Incomplete
**Status:** Completed (Dec 24, 2025)  
**Files:** [`src/components/AdminSwapRequests.tsx`](src/components/AdminSwapRequests.tsx), [`src/app/api/admin/swap-requests/route.ts`](src/app/api/admin/swap-requests/route.ts)

- Implemented admin controls: Accept, Decline, Cancel
- Accept assigns selected volunteer to the requester’s shift
- Decline closes the request and requester keeps assignment (confirmed)
- Cancel frees the requester (deletes assignment; increases availability)
- Added Help modal explaining actions to admins
- API now supports PATCH with `{action, accepted_by_id}` and includes `assignment_id` in GET

### 2. Event Management Lacks Auth Enforcement
**Status:** Completed (Dec 24, 2025)  
**Files:** [`src/app/api/events/route.ts`](src/app/api/events/route.ts)

- Added server-side admin role verification for POST/PUT/DELETE
- Uses server Supabase client to check session and profile role
- Returns 401 for unauthenticated, 403 for non-admins; proceeds with service-role for admin ops
- GET remains world-readable

### 3. No Admin Middleware Protection
**Status:** Completed (Dec 24, 2025)  
**Files:** [`src/lib/supabase/middleware.ts`](src/lib/supabase/middleware.ts)

- Middleware enforces admin role check for `/admin/*` routes
- Redirects unauthenticated users to login
- Redirects non-admins to home page
- Added super_admin role (cannot be demoted by regular admins)
- Superadmin transfer only possible by current super_admin via UI

### 4. Event Editing Can Accidentally Remove Volunteers
**Status:** Completed (Dec 24, 2025)  
**Files:** [`src/app/api/events/route.ts`](src/app/api/events/route.ts)

- Implemented ID-based sub-shift updates (preserves assignments when editing times/capacity)
- Only deletes sub-shifts intentionally removed from the form
- Blocks deletion of sub-shifts with assignments unless `force: true`
- Returns 409 with details (`assigned_sub_shifts`, `counts`) to drive UI confirmation
- Prevents accidental removal of volunteer assignments without explicit confirmation

---

## 🟡 Medium Priority Features

### 5. Admin Volunteers View is a Placeholder
**Status:** Completed (Dec 24, 2025)  
**Files:** [`src/app/admin/volunteers/page.tsx`](src/app/admin/volunteers/page.tsx), [`src/components/AdminVolunteersList.tsx`](src/components/AdminVolunteersList.tsx), [`src/app/api/admin/volunteers/route.ts`](src/app/api/admin/volunteers/route.ts)

- Implemented volunteer roster with searchable list of all volunteers
- Added volunteer detail modal showing full assignment history
- Created API endpoints: `/api/admin/volunteers` (list) and `/api/admin/volunteers/{id}` (details)
- Displays volunteer name, email, assignment count, and last active date
- Shows past/upcoming assignments with event details and status
- Integrated with new super_admin role system (see settings for role management)

### 6. Two Calendar Components - One Unused
**Status:** Code cleanup needed  
**Files:** [`src/components/AdminSchedule.tsx`](src/components/AdminSchedule.tsx), [`src/components/AdminCalendar.tsx`](src/components/AdminCalendar.tsx)

- `AdminSchedule.tsx` is imported and used in admin events page
- `AdminCalendar.tsx` (react-big-calendar with timezone support) exists but is never imported
- **Action needed:** Decide which to keep, remove or properly wire up the other

### 7. Admin Role Management is Isolated
**Status:** Orphaned component  
**Files:** [`src/components/AdminRoles.tsx`](src/components/AdminRoles.tsx)

- Component exists and works (`/api/admin/users` PATCH)
- Not integrated into any page
- **Action needed:** Add to admin settings or volunteers page

### 8. Settings are Minimal
**Status:** Incomplete  
**Files:** [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx), [`src/app/api/settings/route.ts`](src/app/api/settings/route.ts)

- Only has timezone selector
- Missing:
  - Organization name/logo
  - Notification preferences
  - Reminder timing configs
  - Allow self-signup toggle (exists in DB but no UI)
- `user_preferences` table exists but no UI to manage it
- **Action needed:** Expand settings UI with org config and user preferences

---

## 🔵 Low Priority / Future Features

### 9. No Notification/Reminder System
**Status:** Not implemented (README promises this)  
**Impact:** Critical feature missing

- README promises "Automatic Reminders 24h before shifts"
- README promises "48h unfilled slot alerts for admins"
- No email sending code anywhere (no Resend/SendGrid integration)
- No cron jobs or scheduled functions (Supabase Edge Functions or similar)
- `user_preferences.email_notifications` exists but isn't used
- **Action needed:**
  1. Set up email service (Resend/SendGrid)
  2. Create scheduled function for reminder checks
  3. Implement email templates
  4. Add notification preference UI

### 10. Database Features Not Implemented
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

### 11. Reporting is Missing
**Status:** Not implemented (README promises this)

- README promises "Download CSV/PDF reports of hours and shift history"
- No export functionality anywhere
- No reports or analytics pages
- **Action needed:**
  1. Create reports page
  2. Add CSV export for volunteer hours
  3. Add PDF generation for shift schedules
  4. Add analytics dashboard (optional)

### 12. Mobile Push Notifications
**Status:** Not implemented (README mentions this)

- README mentions "browser push notifications"
- No service worker implementation
- No push subscription handling
- **Action needed:** Implement Web Push API if desired

---

## 📊 Summary

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 High  | 4     | Security & data integrity issues |
| 🟡 Medium | 4    | Missing core features |
| 🔵 Low   | 4     | Future enhancements |
| **Total** | **12** | Open issues |

---

## Notes

- Security issues (auth enforcement, middleware) should be addressed first
- Notification system is a major promised feature that's completely missing
- Several database fields/tables exist but are unused (technical debt)
- Consider creating GitHub issues for tracking individual items