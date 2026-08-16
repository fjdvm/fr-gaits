# 01 — Auth + Roles + Admin Approval

**What to build:** Install Supabase client, Prisma, and shadcn/ui. Create the `users` table with a role column (student, instructor, admin) and an approval_status column. Integrate Supabase Auth for email/password signup and login. Students sign up freely and land on a student dashboard shell. Instructors sign up but land in a "pending" state — they see a "waiting for approval" page. Build an admin dashboard page that lists pending instructors with an "Approve" button. Implement role-based middleware that gates routes and redirects each role to the correct dashboard. After this ticket, a fresh user can register, log in, and reach their role-appropriate dashboard.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Supabase client, Prisma ORM, and shadcn/ui installed and configured
- [ ] Prisma schema defines `users` table with id, email, role (student/instructor/admin), approval_status, created_at
- [ ] Initial Prisma migration runs successfully against Supabase PostgreSQL
- [ ] Student signup creates a user with role=student and lands on student dashboard
- [ ] Instructor signup creates a user with role=instructor, approval_status=pending, and shows a "waiting for approval" page
- [ ] Admin dashboard lists pending instructors and approves them
- [ ] Role-based middleware redirects unauthenticated users to login, and authenticated users to their role's dashboard
- [ ] Login works for all three roles
