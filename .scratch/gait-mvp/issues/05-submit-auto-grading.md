# 05 — Submit + Auto-Grading

**What to build:** Create the `submissions` table. A "Submit" button in the assignment workspace runs the student's code against all test cases (visible + hidden) via Judge0, computes a score (passed / total), and stores the submission record with: code, timestamp, per-test-case pass/fail results (JSON), score, and behavioral signals (JSON). Only one submission per student per assignment is allowed (enforced with a unique constraint on student_id + assignment_id). Submissions are rejected after the due date (server-side check). After submission, the student sees pass/fail per test case (including hidden ones now revealed) and their final score. The assignment status on the dashboard updates to "submitted." The editor becomes read-only after submission.

**Blocked by:** 04 — Code Editor + Judge0 Execution (Run)

**Status:** ready-for-agent

- [ ] Prisma schema adds `submissions` (id, student_id, assignment_id, code, submitted_at, test_results JSON, score, behavioral_signals JSON) with unique constraint on (student_id, assignment_id); migration runs
- [ ] "Submit" button runs code against all test cases (visible + hidden) and stores the submission
- [ ] Score computed as (passed test cases / total test cases)
- [ ] One submission per student per assignment enforced — second attempt is rejected
- [ ] Submissions rejected after due date with clear error message
- [ ] Student sees pass/fail per test case (including previously hidden ones) and final score after submit
- [ ] Dashboard assignment status updates to "submitted"
- [ ] Editor and workspace become read-only after submission
