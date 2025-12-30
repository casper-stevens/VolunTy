# VolunTy

**VolunTy** is a free and open-source platform for managing work and volunteer scheduling. It’s built for teams and organizations that need powerful calendar/event management and an easy way for volunteers to find, sign up for, or swap shifts—no more spreadsheets or chat groups!


![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)


## ⭐️ What can VolunTy do?

- **Admin Dashboard:** Drag-and-drop events and create shifts and sub-roles on a shared calendar. Set maximum participants per slot and spot gaps at a glance.
- **Flexible Shifts:** Events feature *sub-shifts*—for example, you can define roles like "Bar," "Check-In," or "Games," each with their own time blocks and capacity.
- **Volunteer Portal:** Volunteers log in, see available opportunities, and sign up for open slots with one click.
- **Shift Swapping:** Can’t make a shift? Request to swap; if someone accepts, the schedule updates and everyone is notified!
- **Automatic Reminders:** Reminders can be sent the day before shifts.


## 🚀 Quick Start

**Try VolunTy for your organization in just a few steps!**

1. **Clone the Repo**
   ```bash
   git clone https://github.com/casper2403/VolunTy.git
   cd VolunTy
   ```

2. **Set Up Backend**
   - [Create a free Supabase account](https://supabase.com/) and a new project.
   - Run the database SQL setup provided in [`/supabase/migrations`].
   - Put your Supabase credentials in `.env.local`.

3. **Install & Start**
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and register your first admin account.

4. **Invite Volunteers**
   - Volunteers register on the site, choose shifts, and can manage swaps immediately.


## 👀 Main Screens

### **Admin Calendar**
- Visual calendar lets you add/edit/delete events.
- Assign multiple roles per event, define who and how many people are needed and when.
<!--- Screenshot: ![Admin Calendar – overlapping events](public/screenshots/admin-calendar-overlap.png)--->

### **Volunteer View**
- Browse all open shifts.
- See your confirmed assignments, request to swap shifts, and get reminder notifications.
<!--- Screenshot: ![Volunteer – browse & swap](public/screenshots/volunteer-browse-swap.png)

### **Swap Flow**
- Request a swap and confirm once another volunteer accepts.
- Screenshot: ![Swap request flow](public/screenshots/swap-flow.gif)

### **Event Detail & Sub-shifts**
- Inspect an event’s sub-shifts with capacities, minimum needed, and current assignments.
- Screenshot: ![Event detail with sub-shifts](public/screenshots/event-subshifts.png)

### **Mobile Views (optional)**
- Show the calendar and signup screens on mobile to highlight responsiveness.
- Screenshot: ![Mobile calendar](public/screenshots/mobile-calendar.png) ![Mobile signup](public/screenshots/mobile-signup.png)

Place your image files in `public/screenshots/` so they are served by Next.js without extra config. Use PNG/WebP for stills and GIF for flows. Keep alt text descriptive, as above.--->


## 🧩 Integrations

- **Authentication:** Secure login via Google (Supabase Auth)
- **Database:** PostgreSQL (Supabase)
- **Notifications:** Browser push notifications


## 🛠️ Tech Stack (For Deployers & Developers)

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Hosting:** Vercel or any Node.js-compatible provider


## 🌍 Get Involved

- **Want to use VolunTy?** Clone this repo and follow the “Quick Start” above.
- **Found a bug or want a feature?** Open an issue or discussion [here](https://github.com/casper2403/VolunTy/issues).
- **Contributions welcome!** Fork and PR anytime.


## 📄 License

MIT — use, modify, and share as you like.

---

**VolunTy**: Modern Volunteer Management, made easy!  
Star this repo if you want to support the project ⭐
