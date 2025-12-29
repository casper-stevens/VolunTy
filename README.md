# VolunTy

**VolunTy** is a free and open-source platform for managing work and volunteer scheduling. It’s built for teams and organizations that need powerful calendar/event management and an easy way for volunteers to find, sign up for, or swap shifts—no more spreadsheets or chat groups!


![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## ⭐️ What can VolunTy do?

- **Admin Dashboard:** Drag-and-drop events and create shifts and sub-roles on a shared calendar (monthly, weekly, daily views). Set maximum participants per slot and spot gaps at a glance.
- **Flexible Shifts:** Events feature *sub-shifts*—for example, you can define roles like "Bar," "Check-In," or "Games," each with their own time blocks and capacity.
- **Volunteer Portal:** Volunteers log in, see available opportunities, and sign up for open slots with one click.
- **Shift Swapping:** Can’t make a shift? Request to swap; if someone accepts, the schedule updates and everyone is notified!
- **Automatic Reminders:** Reminders are sent 24 hours before shifts, and admins get notified if any important slots remain unfilled 48 hours ahead of time.
- **Audit & Reporting:** Download CSV/PDF reports of hours and shift history, with real-time logs of all activity.
- **Mobile-first Design:** The app works great on phones and tablets so volunteers can always check and manage their schedule.

---

## 🚀 Quick Start

**Try VolunTy for your organization in just a few steps!**

1. **Clone the Repo**
   ```bash
   git clone https://github.com/casper2403/VolunTy.git
   cd VolunTy
   ```

2. **Set Up Backend**
   - [Create a free Supabase account](https://supabase.com/) and a new project.
   - Run the database SQL setup provided in [`README.md`](#database-schema) or [`/supabase/migrations`].
   - Put your Supabase credentials in `.env.local`.

3. **Install & Start**
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and register your first admin account.

4. **Invite Volunteers**
   - Volunteers register on the site, choose shifts, and can manage swaps and preferences immediately.

> **Note**: For detailed setup, notifications, and deployment, see the [‘Getting Started’ section](#getting-started) below.

---

## 👀 Main Screens

### **Admin Calendar**
- Visual calendar lets you add/edit/delete events.
- Assign multiple roles per event, define who and how many people are needed and when.
- Get notified if critical slots aren’t filled before an event.

### **Volunteer View**
- Browse all open shifts.
- See your confirmed assignments, request to swap shifts, and get reminder emails/notifications.

---

## 🧩 Integrations

- **Authentication:** Secure login via email/password (Supabase Auth)
- **Database:** PostgreSQL (Supabase)
- **Emails & Notifications:** Supports email reminders, browser push notifications

---

## 🛠️ Tech Stack (For Deployers & Developers)

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Email:** Resend/SendGrid (or any transactional email)
- **Hosting:** Vercel or any Node.js-compatible provider

---

## 🗂️ Example Database Schema

(See `/supabase/migrations/` or run in your Supabase SQL Editor)

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  -- ... more fields for description/location
);

CREATE TABLE sub_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  role_name TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  max_capacity INT NOT NULL,
  -- ...
);

CREATE TABLE shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_shift_id UUID REFERENCES sub_shifts(id),
  volunteer_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('confirmed','pending_swap')),
  -- ...
);

-- See the original [README](README.md) for the complete and up-to-date schema!
```

---

## 🌍 Get Involved

- **Want to use VolunTy?** Clone this repo and follow the “Quick Start” above.
- **Found a bug or want a feature?** Open an issue or discussion [here](https://github.com/casper2403/VolunTy/issues).
- **Contributions welcome!** Fork and PR anytime.

---

## 📄 License

MIT — use, modify, and share as you like.

---

**VolunTy**: Modern Volunteer Management, made easy!  
Star this repo if you want to support the project ⭐
