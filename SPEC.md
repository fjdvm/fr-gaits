# Spec: GAIT MVP — Gamified AI-Assisted Integrated Tutoring System

**Label:** `ready-for-agent`

---

## Problem Statement

BSIT students currently use fragmented tools — a separate LMS, IDE, and general-purpose AI chatbots — to complete programming assignments. This fragmentation adds cognitive overhead, and unrestricted AI access erodes independent problem-solving skills. Instructors have no visibility into how much AI help a student received or whether code was genuinely authored by the student.

---

## Solution

A single web platform (GAIT) that integrates a code editor, assignment management, and an AI tutoring assistant with built-in guardrails. The AI tutor provides progressively specific hints (not solutions) gated by a "hearts" mechanic. Gamification elements (XP, levels, badges, leaderboards, streaks) motivate engagement. Behavioral signals give instructors visibility into code authorship.

---

## User Stories

1. As a student, I want to sign up with my email so that I can access the platform immediately.
2. As a student, I want to join a class using a code my instructor gave me so that I see the correct assignments.
3. As a student, I want to join multiple classes so that I can access assignments from all my programming courses.
4. As a student, I want to see a dashboard of my assignments per class with due dates and statuses so that I know what's pending.
5. As a student, I want to write code in a Monaco editor with syntax highlighting so that I have a comfortable coding experience.
6. As a student, I want to run my code and see stdout/stderr so that I can debug iteratively.
7. As a student, I want to run my code against visible test cases so that I can check my approach before submitting.
8. As a student, I want to submit my code once as a final answer so that my work is graded.
9. As a student, I want to see pass/fail results per test case (including hidden ones) after submitting so that I know my final score.
10. As a student, I want to ask the AI tutor a question scoped to my current assignment so that I get help without leaving the platform.
11. As a student, I want the AI tutor to give me a hint rather than the answer so that I learn to solve problems independently.
12. As a student, I want each subsequent hint to be more specific than the last so that I get progressively more help as I'm truly stuck.
13. As a student, I want to see my hearts count so that I know how much AI help I have left.
14. As a student, I want to see a live regeneration timer when I'm out of hearts so that I know when I can ask again.
15. As a student, I want to review my previous AI tutor messages when I have 0 hearts so that I can re-read earlier hints.
16. As a student, I want to see my XP, level, and XP progress bar so that I feel a sense of progression.
17. As a student, I want to earn XP for submitting assignments, passing test cases, getting perfect scores, using fewer hints, and maintaining streaks so that multiple behaviors are rewarded.
18. As a student, I want to earn badges for achievements so that I have goals to aim for.
19. As a student, I want to see the class leaderboard (top N) so that I know where I stand relative to peers.
20. As a student, I want to see my own rank even if I'm outside the top N so that I still have visibility into my position.
21. As a student, I want to maintain a weekly streak by submitting at least once per week so that consistent effort is rewarded.
22. As a student, I want streamed AI responses (token by token) so that the tutor feels responsive.
23. As an instructor, I want to sign up and get approved by an admin so that only verified faculty have instructor access.
24. As an instructor, I want to create multiple classes and get a unique join code for each so that I can manage multiple sections.
25. As an instructor, I want to create an assignment with a title, instructions, language, and due date so that students know what to do.
26. As an instructor, I want to define visible test cases (shown to students during Run) and hidden test cases (revealed only on Submit) so that students can self-check without gaming the system.
27. As an instructor, I want to assign an assignment to one or multiple classes so that I don't duplicate work across sections.
28. As an instructor, I want to configure the number of hearts (default 5) per assignment so that I can tune how much AI help is available.
29. As an instructor, I want to configure the heart regeneration cooldown (default 30 min) per assignment so that I can control the pacing.
30. As an instructor, I want to pick the programming language for an assignment from a supported list (Python, C, JavaScript, C#) so that it matches my curriculum.
31. As an instructor, I want to view a table of all students' scores for a given assignment so that I can see class performance at a glance.
32. As an instructor, I want to click into an individual student's submission and see their code, test results, AI tutor conversation, and behavioral signals so that I can assess their understanding and authorship.
33. As an instructor, I want to see behavioral signals (paste events, typing speed, time spent) per submission so that I can identify potentially suspicious work.
34. As an instructor, I want to optionally add my own LLM API key (GPT, Claude, Gemini, Groq) so that my class uses a model I prefer.
35. As an instructor, I want the system to fall back to the default Groq key if my key fails so that students are never blocked.
36. As an instructor, I want to configure the leaderboard size (top N) for my class so that it fits my pedagogical preferences.
37. As an instructor, I want to see the full class ranking (not just top N) so that I have complete visibility.
38. As an admin, I want to approve instructor account signups so that only verified faculty get instructor access.
39. As an admin, I want to configure the default Groq API key via environment variables so that the platform works out of the box.
40. As an admin, I want to manage platform-wide rate limiting settings so that the system stays stable.

---

## Implementation Decisions

### Architecture
- **Monorepo with Next.js App Router** — frontend pages and API routes in a single codebase. No separate backend service.
- **Supabase** for PostgreSQL database hosting, authentication, and real-time subscriptions.
- **Prisma ORM** for type-safe database access and migrations.
- **Vercel** for deployment of the Next.js app.

### Authentication & Authorization
- Supabase Auth handles email/password signup and session management.
- Three roles: `student`, `instructor`, `admin`. Stored as a column on the user record.
- Students sign up freely. Instructors sign up but remain in a "pending" state until an admin approves.
- Role-based middleware gates access to dashboards and API routes.

### Classes & Enrollment
- Class entity has: id, name, instructor_id, join_code (unique random string), created_at.
- Many-to-many relationship between students and classes via an enrollment table.
- Join code is generated on class creation, shareable by instructor.

### Assignments & Test Cases
- Assignment belongs to one or many classes (many-to-many via assignment_classes join table).
- Each assignment specifies: language, instructions, due_date, hearts_count, hearts_regen_minutes.
- Test cases have a `visible` boolean flag — visible ones are used during "Run," all are used on "Submit."

### Code Execution
- **Judge0 Cloud API** — POST student code, receive stdout/stderr/status.
- Rate limited at the application layer: 5 runs per minute per student.
- Execution timeout set to 10 seconds via Judge0 API parameter.
- Grading: compare actual output against expected output per test case, compute score as (passed / total).

### AI Tutor
- **Vercel AI SDK** abstracts multiple LLM providers behind a unified streaming interface.
- System prompt includes: assignment instructions, student's current code, test results from their last run, and full conversation history.
- System prompt enforces tiered hint behavior based on the number of hearts already spent (tier 1–5).
- Intent guardrail in the system prompt: detect requests for direct answers, redirect with Socratic questions.
- Responses are streamed token-by-token to the client.

### AI Provider Routing & Fallback
- Default provider: Groq (API key in server environment variable).
- Instructor can optionally configure an alternative provider + key (stored encrypted in the database, decrypted server-side per request).
- Fallback logic: attempt instructor's key → on failure/rate-limit, retry with default Groq key.
- Provider selection handled via Vercel AI SDK's provider registry.

### Hearts Mechanic
- Hearts state stored per (student, assignment): current_count, last_regen_at, total_spent.
- On each AI tutor message sent: decrement hearts, increment total_spent, determine hint tier = total_spent.
- Regeneration computed server-side: elapsed time since last_regen_at ÷ cooldown = hearts to restore, capped at max.
- Client polls or subscribes (Supabase Realtime) for live timer updates.
- At 0 hearts: API rejects new chat messages, client shows read-only chat.

### Gamification
- **XP**: Awarded on events (submit, pass_case, perfect_score, no_hints, fewer_hints, streak_maintained). Fixed values for MVP.
- **Levels**: Defined by XP thresholds. Display-only (no unlocks).
- **Badges**: Predefined set with trigger conditions (e.g., first_submit, perfect_score, no_hints_used, streak_5). Awarded asynchronously when conditions are met.
- **Leaderboard**: Aggregated query of total XP per student within a class. Top N shown publicly, full list for instructor.
- **Streaks**: Weekly cadence. A flag/job checks if at least one submission exists in the past 7 days. Resets to 0 if missed.

### Behavioral Tracking
- Editor events captured client-side: paste events (count + character length), keystroke timing (words per minute approximation), total time with editor focused.
- Stored as JSON alongside the submission record.
- Displayed to instructor as raw signals — no computed "score" or accusation.

### UI
- **shadcn/ui + Tailwind CSS** for all components.
- **Monaco Editor** embedded for the code workspace.
- Basic responsive: dashboards usable on mobile, code editor desktop-focused.
- Toast notifications (shadcn toast) for submission confirmation and hearts regeneration.

### Real-time
- AI tutor responses: streamed via Vercel AI SDK (HTTP streaming).
- Hearts timer: Supabase Realtime subscription or client-side countdown synced on page load.

### Submissions
- One final submit per student per assignment (enforced at DB level with a unique constraint on student_id + assignment_id).
- After due date: API rejects submissions (server-side check).
- Submission record stores: code, timestamp, test_results (JSON), score, behavioral_signals (JSON).
- After submission: AI tutor chat becomes read-only (no new messages allowed).

---

## Testing Decisions

### What makes a good test
- Tests verify external behavior through the module's public interface (API routes, exported functions).
- Tests do not assert on internal implementation details (specific DB queries, internal state shape).
- Tests use realistic data that matches the domain (actual code strings, real test case structures).

### Modules to test
- **Auth & role middleware** — verify students can't access instructor routes, pending instructors are blocked, admin-only routes are protected.
- **Hearts mechanic** — verify consumption, regeneration calculation, rejection at 0, tier computation.
- **Code execution integration** — verify Judge0 API calls are constructed correctly, responses are parsed, rate limiting works.
- **Submission & grading** — verify one-submit enforcement, due date cutoff, score calculation, XP awards.
- **AI tutor routing** — verify provider fallback chain, system prompt construction with correct tier, streaming response shape.
- **Gamification engine** — verify XP awards for each trigger, level computation, badge conditions, streak logic.
- **Join code enrollment** — verify code validation, duplicate join prevention, multi-class support.

### Prior art
- No existing tests in the repo (fresh scaffold). Testing framework to be set up as part of build step 1 (likely Vitest for unit/integration + Playwright for E2E).

---

## Out of Scope

- Adaptive hint difficulty (Bayesian Knowledge Tracing or similar ML-based difficulty adjustment)
- Plagiarism/similarity detection between student submissions
- Analytics dashboards beyond what's visible on dashboards (usage trends, common error patterns)
- Configurable XP values (fixed for MVP, tunable later)
- Custom instructor-created badges
- Load balancing / horizontal scaling / multi-region deployment
- Password reset and email verification flows
- Full mobile optimization (beyond basic responsive)
- LMS integrations (Moodle, Google Classroom, Teams)
- Admin panel beyond instructor approval and API key management
- Languages beyond Python, C, JavaScript, C#
- Multiple submissions per assignment
- Student-facing BYOK (only instructors/admins configure API keys)

---

## Further Notes

- This is a thesis project for a usability/acceptability study. The MVP success criteria are defined by 9 end-to-end user flows that must work without developer intervention.
- No hard deadline — the system should be built properly rather than rushed.
- The "gamified" framing in the thesis is supported by four mechanics: hearts (resource management), XP + levels (progression), badges (achievement), leaderboard + streaks (social/consistency). This gives enough surface area for the research evaluation instrument.
- The behavioral confidence indicator is P1 — it can slip if timeline gets tight, since the AI tutor conversation visibility already gives instructors partial insight into student behavior.
- Judge0 Cloud API free tier (100 submissions/day) may be sufficient for the evaluation cohort (~30-50 students). Monitor usage and upgrade if needed.
- The tiered hint system's effectiveness is itself a research output — the 5-tier linear model is a hypothesis that the study will validate or challenge.
