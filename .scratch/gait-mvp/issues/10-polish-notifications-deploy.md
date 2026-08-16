# 10 — Polish, Notifications, and Deploy

**What to build:** Add toast notifications for key events: assignment submitted successfully, hearts regenerated. Polish the responsive layout: dashboards should be usable on mobile, the code editor workspace is desktop-focused. Admin can configure platform-wide rate limiting settings. Finalize Vercel deployment configuration and Judge0 Cloud API setup. Verify all 9 success-criteria flows work end-to-end without developer intervention: (1) admin approves instructor + configures API key, (2) instructor creates class + assignment with test cases, (3) student joins + sees assignment, (4) student writes and runs code, (5) student uses AI tutor with tiered hints, (6) student exhausts hearts + sees regen timer, (7) student submits + sees score + earns XP/badge, (8) student views leaderboard and level/streak, (9) instructor views submission + tutor chat + behavioral signals.

**Blocked by:** 07 — AI Provider Configuration + Fallback, 08 — Gamification, 09 — Instructor Submission View + Behavioral Signals

**Status:** ready-for-agent

- [ ] Toast notifications fire on: assignment submitted, hearts regenerated
- [ ] Dashboard layouts are responsive and usable on mobile
- [ ] Code editor workspace functions correctly on desktop
- [ ] Admin can configure default API key via environment/settings
- [ ] Vercel deployment configuration is complete and app deploys successfully
- [ ] Judge0 Cloud API is configured and functional in production
- [ ] All 9 MVP success-criteria flows pass end-to-end without developer intervention
