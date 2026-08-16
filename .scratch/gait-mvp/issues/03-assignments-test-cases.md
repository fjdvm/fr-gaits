# 03 — Assignments + Test Cases

**What to build:** Create `assignments`, `assignment_classes`, and `test_cases` tables. Instructor can create an assignment within a class: title, instructions (text), language (Python, C, JavaScript, or C#), due date, hearts count (default 5), and hearts regeneration cooldown (default 30 min). Instructor defines test cases as input/expected-output pairs, each marked as visible or hidden. An assignment can be assigned to one or multiple classes via the join table. Instructor sees a list of their assignments. Student dashboard now shows assignments per class with due date and status (not started / in progress / submitted).

**Blocked by:** 02 — Classes + Join Code Enrollment

**Status:** ready-for-agent

- [ ] Prisma schema adds `assignments` (id, title, instructions, language, due_date, hearts_count, hearts_regen_minutes, created_by, created_at), `assignment_classes` (assignment_id, class_id), and `test_cases` (id, assignment_id, input, expected_output, visible) tables; migration runs
- [ ] Instructor can create an assignment with all required fields and pick a language from [Python, C, JavaScript, C#]
- [ ] Instructor can add visible and hidden test cases to an assignment
- [ ] Assignment can be assigned to one or multiple classes
- [ ] Instructor dashboard lists their created assignments
- [ ] Student dashboard shows assignments per enrolled class with due date
- [ ] Assignment status shows "not started" for assignments the student hasn't interacted with
