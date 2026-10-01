# HealthLine — Admin Panel roadmap

**Repo:** `E:\APK\AdminPanel`  
**Stack:** Next.js 14 + MongoDB + JWT  
**Audience:** Internal staff only. Users never see this.  
**Safety:** Admin must not get unrestricted access to private health data. Use permissions + audit logs.  
**AI rule:** Assist only. Do not diagnose. Do not replace doctors.

Read this file before adding admin pages. The APK checklist is in `E:\APK\healthline\HEALTHLINE_APK.md`.

---

## Status key

- `[x]` Done
- `[ ]` Not done

---

## Phase 0 — Foundation (done)

- [x] Admin-only site (no public user / shop / marketing routes)
- [x] Simple auth routes: `/auth/sign-in`, `/auth/forgot-password`
- [x] Centered login (no split illustration)
- [x] Admin login only — no admin self-registration
- [x] Forgot-password screen (UI only; email send not wired)
- [x] MongoDB connection (`MONGODB_URL` + `DB_NAME`)
- [x] Auth APIs: `POST /api/auth/sign-in`, `POST /api/auth/sign-up` (users / APK), `GET /api/auth/me`
- [x] Admin sign-in rejects non-admin accounts (`adminOnly`)
- [x] JWT + bcrypt passwords
- [x] Seed command: `npm run seed` (`scripts/seed.mjs` — users now; more collections later)
- [x] Brand presets: **blue** `#0070E0` and **green** `#2ECC71` only

**Default admin (after seed):** `admin@healthline.local` / `Admin@123`

Template demo pages (ecommerce, banking, kanban, etc.) still exist. Replace them with HealthLine admin modules below. Do not rebuild auth.

---

## Phase 1 — Admin shell (next)

Build the real left-nav. Remove unused Minimal demo items.

Target menu:

```
Dashboard
Users
Subscriptions
Payments
AI
Food Database
Recipes
Workout Programs
Health Tracks
Content
Languages
Notifications
Reports
Support
Security
Settings
Audit Logs
```

- [x] Replace `src/layouts/config-nav-dashboard.jsx` with the menu above
- [x] Add pages for each item with **static demo data** (`src/_mock/_healthline.js`)
- [ ] Role/permission guard on every admin page
- [x] Keep `/auth/sign-in` as the only public entry

**Routes (static UI):**

| Page | Path |
|------|------|
| Dashboard | `/dashboard` |
| Users | `/dashboard/users` |
| Subscriptions | `/dashboard/subscriptions` |
| Payments | `/dashboard/payments` |
| AI | `/dashboard/ai` |
| Food Database | `/dashboard/foods` |
| Recipes | `/dashboard/recipes` |
| Workout Programs | `/dashboard/workouts` |
| Health Tracks | `/dashboard/tracks` |
| Content | `/dashboard/content` |
| Languages | `/dashboard/languages` |
| Notifications | `/dashboard/notifications` |
| Reports | `/dashboard/health-reports` |
| Support | `/dashboard/support` |
| Security | `/dashboard/security` |
| Settings | `/dashboard/app-settings` |
| Audit Logs | `/dashboard/audit-logs` |

---

## Phase 2 — Dashboard

Today’s snapshot (then later trends):

- [ ] Users count
- [ ] Active users
- [ ] New users
- [ ] Premium count
- [ ] Revenue
- [ ] AI requests
- [ ] Reports uploaded
- [ ] Later: DAU, MAU, retention, conversion, churn, LTV, ARPU

---

## Phase 3 — User management

Search by email / name. List: name, plan, status.

User detail tabs: Account · Subscription · Usage · AI usage · Devices · Activity · Payments · Support · Security

- [ ] Real users from MongoDB (not template mock list)
- [ ] Search + filters (plan, status)
- [ ] User profile view
- [ ] Block / unblock
- [ ] **Minimum required health data only**
- [ ] Permission check before opening health fields
- [ ] Audit every health-data view

---

## Phase 4 — Subscriptions + payments

Plans: Free · Plus Monthly · Plus Annual · Family Monthly · Family Annual

- [ ] Plan catalog (create / edit prices — test, do not lock forever)
- [ ] Status: Active / Cancelled / Expired / Trial / Refunded
- [ ] MRR, ARR, conversion, churn
- [ ] Payment history
- [ ] Refund action (with audit)

**Suggested test prices (not final):** Plus ₹199/mo or ₹1,999/yr · Family ₹299/mo or ₹2,999/yr

---

## Phase 5 — Food database

Developers should not edit foods in code.

- [x] Search foods
- [x] Fields: calories, protein, carbs, fat, serving size, cuisine, category, image
- [x] Add / edit / delete
- [x] Approve / archive
- [x] APIs the APK can consume (`GET/POST /api/foods`, `GET/PUT/DELETE /api/foods/:id`)

---

## Phase 6 — Recipes

- [ ] List + filters: cuisine (Gujarati, Punjabi, South/North Indian), healthy, high protein, weight management, meal type
- [ ] Create / edit: ingredients, nutrition, photos, instructions, tags
- [ ] Multi-language fields
- [ ] Publish / unpublish
- [ ] APK reads **published** recipes only

---

## Phase 7 — Workout programs

- [ ] Tags: beginner / intermediate / advanced, home / gym / no equipment, strength / mobility / walking / stretching
- [ ] Create / edit / publish approved programs
- [ ] AI may personalize **approved** workouts only (do not invent unsafe routines)

---

## Phase 8 — Health tracks

Tracks: Weight Management · Better Sleep · Active Lifestyle · Strength · Healthy Eating · Stress Management

Each track: goals, habits, meal recs, workout recs, education, milestones

- [ ] CRUD tracks
- [ ] Attach content + milestones
- [ ] Publish to APK

---

## Phase 9 — Content CMS

- [ ] Articles, health guides, sleep guides, nutrition guides, FAQs, videos
- [ ] Publish / unpublish
- [ ] APK consumes published content only

---

## Phase 10 — Languages

V1: English, Hindi, Gujarati. V2: Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam, Punjabi

- [ ] Language on/off toggles
- [ ] Review / approve translations (`en` / `hi` / `gu`)
- [ ] Do not manually translate thousands of strings in the UI by hand

---

## Phase 11 — Notifications

- [ ] Push / email / in-app campaigns
- [ ] Templates (7-day streak, weekly report ready, new recipes)
- [ ] Do not spam

---

## Phase 12 — AI management + safety

**Control panel**

- [ ] Models, prompts, system instructions
- [ ] Feature flags: Meal Scanner, AI Coach, Voice Logging, Workout AI, Medical AI
- [ ] Usage + token + estimated cost
- [ ] Errors + user feedback
- [ ] Medical AI **OFF** until Phase 14 is ready

**Safety (first-class)**

- [ ] Medical diagnosis → BLOCK
- [ ] Medication changes → BLOCK
- [ ] Emergency symptoms → ESCALATE
- [ ] Self-harm → SAFETY RESPONSE
- [ ] Extreme weight loss → SAFEGUARD

---

## Phase 13 — Analytics

- [ ] Acquisition: downloads, signups, onboarding completion
- [ ] Engagement: DAU / WAU / MAU, sessions, food logs, AI uses, workouts
- [ ] Retention: D1 / D7 / D30 / D90
- [ ] Monetization: Free→Plus, MRR, ARR, churn, refunds, trial conversion

---

## Phase 14 — Reports (medical) — Phase 2, do not block V1

- [ ] Lab / blood-report templates
- [ ] Admin review of parsed reports
- [ ] Store parsed labs + timeline (strict access)
- [ ] Reminder jobs for follow-ups
- [ ] Copy: informational only; see a clinician

---

## Phase 15 — Support + security

- [ ] Support tickets: open / pending / resolved
- [ ] Settings
- [ ] Audit logs (who viewed what, especially health data)
- [ ] Security page (roles, sessions)

---

## Shared APIs (admin + APK)

Build once. Admin UI and the HealthLine APK both call the same backend.

Already live:

- [x] `/api/auth/sign-in`
- [x] `/api/auth/sign-up` (creates **user** role only — for APK later)
- [x] `/api/auth/me`

Still needed (examples):

- [ ] Foods, recipes, workouts, tracks, content
- [ ] Subscriptions
- [ ] Diary / progress sync
- [ ] AI usage + limits
- [ ] Notifications
- [ ] Health records (Phase 2)

---

## Build order (do this sequence)

1. Admin nav + empty pages  
2. Users (Mongo list + search)  
3. Food database  
4. Recipes  
5. Workouts + Health tracks  
6. Content + languages  
7. Dashboard KPIs  
8. Subscriptions + payments  
9. AI flags + safety  
10. Notifications  
11. Analytics  
12. Support + audit  
13. Medical reports (Phase 2)

---

## Do not

- Let admin freely open every user’s medical data
- Let AI prescribe or change medicines
- Claim diagnosis or medical accuracy
- Paywall basic logging on the APK (see APK file)
- Put a consumer user panel in this repo
