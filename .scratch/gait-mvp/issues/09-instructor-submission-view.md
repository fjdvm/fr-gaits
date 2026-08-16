# 09 — Instructor Submission View + Behavioral Signals

**What to build:** Instructor can navigate to any of their assignments and see a table of all students' scores for that assignment. Clicking on a student's row opens a detailed view showing: the student's submitted code (rendered in a read-only Monaco editor), per-test-case pass/fail results, the student's full AI tutor conversation history, and behavioral signals (paste event count + character length, typing speed/WPM approximation, total time spent in editor). Behavioral signals are displayed as raw data — no computed "suspicion score" or accusatory labeling. This completes the instructor's grading and assessment workflow.

**Blocked by:** 05 — Submit + Auto-Grading, 06 — AI Tutor Chat + Tiered Hints + Hearts

**Status:** ready-for-agent

- [ ] Instructor can view a score table for any assignment showing all students and their scores
- [ ] Clicking a student opens a detail view with their submitted code in a read-only editor
- [ ] Per-test-case pass/fail results are displayed
- [ ] Full AI tutor conversation history is shown
- [ ] Behavioral signals displayed: paste events (count + char length), typing speed, time spent
- [ ] Signals are presented as raw data without accusatory scoring
- [ ] View works for students who submitted and those who have not (showing "not submitted" status)
