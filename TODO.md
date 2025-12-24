# VolunTy - TODO List

*Last updated: December 24, 2025*

---

## 🔴 High Priority Issues

### 1. Admin Swap Request Handling is Incomplete
**Status:** Read-only  
**Files:** [`src/components/AdminSwapRequests.tsx`](src/components/AdminSwapRequests.tsx), [`src/app/api/admin/swap-requests/route.ts`](src/app/api/admin/swap-requests/route.ts)

- Component only displays open swap requests
- No accept/decline buttons for admins
- No API endpoint for admin intervention
- Admins can't manually resolve or cancel swap requests
- **Action needed:** Add admin controls to accept/decline/cancel swap requests

### 2. Event Management Lacks Auth Enforcement
**Status:** Security risk  
**Files:** [`src/app/api/events/route.ts`](src/app/api/events/route.ts)

- Uses service-role client for ALL operations (GET, POST, PUT, DELETE)
- No session/role checks - any authenticated request can create/update/delete events
- GET is world-readable (probably okay), but POST/PUT/DELETE need admin-only guards
- **Action needed:** Add role verification to POST/PUT/DELETE handlers

### 3. No Admin Middleware Protection
**Status:** Security risk  
**Files:** [`src/middleware.ts`](src/middleware.ts)

- Middleware only updates sessions, doesn't enforce roles
- Admin routes (`/admin/*`) are accessible to any authenticated user
- No role-based route protection
- **Action needed:** Add role checking in middleware for `/admin/*` routes

### 4. Event Editing Can Accidentally Remove Volunteers
**Status:** Data loss risk  
**Files:** [`src/app/api/events/route.ts`](src/app/api/events/route.ts)

- When editing events, sub-shifts can be deleted which cascades to delete assignments
- No warning to admin if shifts have volunteers already assigned
- Could accidentally remove volunteers from confirmed shifts without notice
- **Action needed:** Add validation and warnings before deleting sub-shifts with assignments

---

## 🟡 Medium Priority Features

### 5. Admin Volunteers View is a Placeholder
**Status:** Not implemented  
**Files:** [`src/app/admin/volunteers/page.tsx`](src/app/admin/volunteers/page.tsx)

- Shows "coming soon" message
- No roster display of all volunteers
- No way to see volunteer assignments or history
- `/api/admin/users` exists but isn't used for volunteer management
- **Action needed:** Build volunteer roster with assignments, contact info, and history

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