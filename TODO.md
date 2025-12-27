# VolunTy - TODO List

*Last updated: December 27, 2025*

---

## 🔴 High Priority Issues

### 1. Database Migration Documentation Outdated
**Status:** New issue (Dec 27, 2025)  
**Files:** [`DEPLOYMENT.md`](DEPLOYMENT.md), [`supabase/migrations/`](supabase/migrations/)

- Deployment guide references `20240523000000_initial_schema.sql` which no longer exists
- Migrations were consolidated on Dec 27, 2025 into:
  - `20240522000000_initial_setup.sql` (complete schema with all tables and policies)
  - `20240523000000_functions_and_triggers.sql` (database functions, triggers, default settings)
- **Action needed:** Update DEPLOYMENT.md to reflect the correct migration files and execution order

### 2. Debug Endpoint Should Be Removed or Secured
**Status:** New issue (Dec 27, 2025)  
**Files:** [`src/app/api/debug/auth/route.ts`](src/app/api/debug/auth/route.ts)

- Created for troubleshooting authentication issues
- Exposes user data and environment information without authentication
- **Action needed:** Either remove before production or add admin-only authentication check

---

## 🟡 Medium Priority Features

### 3. Two Calendar Components - One Unused
**Status:** Code cleanup needed  
**Files:** [`src/components/AdminSchedule.tsx`](src/components/AdminSchedule.tsx), [`src/components/AdminCalendar.tsx`](src/components/AdminCalendar.tsx)

- `AdminSchedule.tsx` is imported and used in admin events page
- `AdminCalendar.tsx` (react-big-calendar with timezone support) exists but is never imported
- **Action needed:** Decide which to keep, remove or properly wire up the other

### 4. Admin Role Management Component Unused
**Status:** Redundant component  
**Files:** [`src/components/AdminRoles.tsx`](src/components/AdminRoles.tsx)

- Standalone AdminRoles component exists but is never imported
- Role management functionality is already integrated into AdminVolunteersList component
- AdminVolunteersList provides promote/demote features with better UX (in context of volunteer details)
- **Action needed:** Remove AdminRoles.tsx as it's redundant

### 5. SuperadminTransfer Component Not Integrated
**Status:** Orphaned component  
**Files:** [`src/components/SuperadminTransfer.tsx`](src/components/SuperadminTransfer.tsx)

- Component exists for super admin role transfer
- Not integrated into any page (settings, volunteers)
- Super admin transfer is mentioned in previous TODO but no UI access
- **Action needed:** Integrate into admin settings page for super_admin users only

### 6. Settings are Minimal
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

### 7. No Notification/Reminder System
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
| 🔴 High  | 2     | Documentation & security issues |
| 🟡 Medium | 4    | Component cleanup & missing features |
| 🔵 Low   | 4     | Future enhancements |
| **Total** | **10** | Open issues |

---

## Notes

- Documentation and debug endpoint should be addressed before production deployment
- Several UI components exist but are not integrated (SuperadminTransfer, AdminRoles, AdminCalendar)
- Notification system is a major promised feature that's completely missing
- Several database fields/tables exist but are unused (technical debt)
- Consider creating GitHub issues for tracking individual items

## Recent Changes (Dec 27, 2025)

- ✅ Consolidated database migrations from 6 files into 2 comprehensive migration files
- ✅ Enhanced auth callback with better OAuth error handling and logging
- ✅ Added debug endpoint for authentication troubleshooting
- ✅ All high-priority security issues from Dec 24 have been completed (swap requests, auth enforcement, middleware protection, event editing safeguards)
- ✅ Admin volunteers view fully implemented with role management
