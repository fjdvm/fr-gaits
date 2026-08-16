# 02 — Classes + Join Code Enrollment

**What to build:** Create `classes` and `enrollments` tables in the Prisma schema. Instructor can create a class by entering a name — the system generates a unique join code. Student can enter a join code to enroll in a class. Both the instructor and student dashboards show a list of their classes. Students can join multiple classes. Instructors can create multiple classes and see enrolled student count per class.

**Blocked by:** 01 — Auth + Roles + Admin Approval

**Status:** ready-for-agent

- [ ] Prisma schema adds `classes` (id, name, instructor_id, join_code, created_at) and `enrollments` (student_id, class_id, enrolled_at) tables; migration runs
- [ ] Instructor dashboard has a "Create Class" flow that generates a unique join code
- [ ] Student dashboard has a "Join Class" flow that accepts a join code and enrolls the student
- [ ] Duplicate enrollment is prevented (student can't join the same class twice)
- [ ] Instructor dashboard lists their classes with join code displayed and student count
- [ ] Student dashboard lists their enrolled classes
- [ ] Both roles can have multiple classes
