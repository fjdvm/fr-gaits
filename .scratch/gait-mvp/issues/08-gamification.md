# 08 — Gamification — XP, Levels, Badges, Leaderboard, Streaks

**What to build:** Create `xp_events`, `badges`, `user_badges`, and `streaks` tables. XP is awarded when a student submits an assignment: fixed values for passing test cases, perfect score bonus, no-hints bonus, fewer-hints bonus, and streak maintenance bonus. Levels are computed from XP thresholds and displayed as a progress bar with a level number on the student dashboard. A predefined set of badges (e.g., "First Submit", "Perfect Score", "No Hints Used", "5-Week Streak") are awarded when conditions are met. A class leaderboard page ranks students by total XP — the top N are shown publicly (N configurable by instructor per class) and students can see their own rank even if outside the top N. Instructors see the full class ranking. Weekly streak tracking: at least one submission per week maintains the streak; missing a week resets it to 0.

**Blocked by:** 05 — Submit + Auto-Grading

**Status:** ready-for-agent

- [ ] Prisma schema adds `xp_events` (id, student_id, event_type, xp_amount, assignment_id, created_at), `badges` (id, name, description, condition), `user_badges` (user_id, badge_id, earned_at), and `streaks` (student_id, current_streak, last_submission_week) tables; migration runs
- [ ] XP awarded on submission for each trigger event (pass_case, perfect_score, no_hints, fewer_hints, streak_maintained)
- [ ] Student dashboard shows total XP, level (from thresholds), and XP progress bar
- [ ] Predefined badges are seeded and awarded when conditions are met
- [ ] Student dashboard shows earned badges
- [ ] Class leaderboard page shows top N students ranked by XP (N configurable by instructor)
- [ ] Students see their own rank even if outside top N
- [ ] Instructors see the full class ranking
- [ ] Weekly streak logic: maintained by submitting at least once per week, resets on miss
- [ ] Student dashboard shows current streak count
