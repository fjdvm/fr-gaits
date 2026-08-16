# Product Requirements Document (PRD)
## GAIT: Gamified AI-Assisted Integrated Tutoring System — MVP

**Version:** 2.0 (MVP)
**Date:** August 2026
**Authors:** Martin, F.J.J.D. / Dumlao, J.A.N.B. / Gabayno, C.M.

---

## 1. Overview

GAIT is a single web-based platform that combines a browser-based code editor, an instructor assignment module, and a hint-based AI tutoring assistant gated by a "hearts" mechanic. This PRD defines the **Minimum Viable Product (MVP)** — the smallest functional version of GAIT that can be deployed to real students and instructors for the study's usability and acceptability evaluation.

The MVP must be enough to test the three research questions:
1. Can the system be built with the described architecture and features?
2. Is it acceptable to students and instructors (functionality, usability, reliability, UI)?
3. What do users say should be improved?

---

## 2. Problem Statement

BSIT students currently juggle an LMS, a separate IDE, and general-purpose AI chatbots to complete programming assignments. This fragmentation adds friction, and unrestricted AI use erodes independent problem-solving. GAIT consolidates these into one platform with a tutoring assistant that gives hints instead of full solutions.

---

## 3. Goals & Non-Goals

### MVP Goals
- Let a student write, run, and submit code for an assignment without leaving the platform.
- Let an instructor create an assignment with test cases and see student results.
- Let a student ask the AI tutor for help and receive a guided, tiered hint — not a full solution.
- Limit AI tutor usage per assignment via a hearts mechanic with regeneration.
- Support login with three roles: student, instructor, and admin.
- Gamify the learning experience with XP, levels, badges, leaderboards, and streaks.
- Provide behavioral signals to instructors for AI-generated code detection.

### Non-Goals (explicitly out of MVP scope)
- Mobile app
- LMS integration (Moodle, Google Classroom, Teams)
- Advanced security (encryption at rest, penetration-tested infra)
- Plagiarism/similarity detection between students
- Adaptive/mastery-based hint difficulty (Bayesian Knowledge Tracing)
- Analytics dashboards beyond basic score/XP visibility
- Support for languages beyond Python, C, JavaScript, C#
- Configurable XP values (fixed for MVP)
- Load balancing (post-MVP)
- Password reset / email verification flows

---

## 4. Target Users

| Role | Description | Primary Need |
|---|---|---|
| Student | BSIT student, 1st–4th year, enrolled in a programming course | Write, test, submit code and get non-answer-revealing help |
| Instructor | Faculty handling programming subjects (admin-approved account) | Create assignments, view submissions, scores, and student behavior |
| Admin | Platform administrator (researcher) | Manage platform-wide config, approve instructors, set default API key |

---

## 5. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js (App Router) | Monorepo — handles both frontend and API routes |
| UI | shadcn/ui + Tailwind CSS | Component library, basic responsive layout |
| Code Editor | Monaco Editor | Syntax highlighting for Python, C, JavaScript, C# |
| Database | PostgreSQL (Supabase) + Prisma ORM | Type-safe queries, easy migrations |
| Auth | Supabase Auth | Open signup for students, admin approves instructors |
| Code Execution | Judge0 Cloud API | Supports all 4 languages, no server to manage |
| AI Tutor | Vercel AI SDK | Multi-provider support (Groq, GPT, Claude, Gemini, etc.) |
| Real-time | Supabase Realtime or polling | Streaming AI responses + live hearts timer |
| Hosting | Vercel | Next.js app deployment |

---

## 6. MVP Feature Set

### 6.1 Authentication & Roles (P0)
- Supabase Auth (email/password signup and login)
- Three roles: student, instructor, admin
- Open signup for students
- Admin approves instructor accounts
- Role-based routing to the correct dashboard

### 6.2 Classes & Enrollment (P0)
- Instructor creates a class → gets a join code
- Students join a class via the join code
- Instructors can create multiple classes
- Students can join multiple classes

### 6.3 Student Dashboard (P0)
- List of assigned tasks with due dates (per class)
- Status indicator per assignment (not started / in progress / submitted)
- XP bar, level, streak count, badges earned

### 6.4 Code Editor (P0)
- Monaco Editor with syntax highlighting for Python, C, JavaScript, C#
- "Run" button to execute code and view stdout/stderr (tested against visible test cases)
- "Submit" button that runs code against all test cases (visible + hidden) — one final submit only
- Behavioral tracking: paste events, typing speed, time spent in editor

### 6.5 Code Execution Engine (P0)
- Judge0 Cloud API for sandboxed execution of 4 supported languages
- Returns output, error, and execution status per run
- Compares actual vs. expected output per test case for grading
- Rate limit: 5 runs/min per student
- Execution timeout: 10 seconds per run

### 6.6 Instructor Assignment Module (P0)
- Create assignment: title, instructions, language (pick from supported list), due date
- Define test cases: visible (students see during Run) and hidden (revealed only on Submit)
- Assign to one or multiple classes
- Configure hearts count (default: 5) and regeneration cooldown (default: 30 min)
- Edit / delete assignment
- View list of assignments created

### 6.7 Submission & Grading (P0)
- One final submission per student per assignment
- Submission stored with: code, timestamp, per-test-case pass/fail, behavioral signals
- Automatic score = (test cases passed / total test cases)
- Hard cutoff on due date — no submissions after
- Unlimited "Run" attempts before submitting

### 6.8 AI Tutoring Assistant (P0)
- Chat panel scoped to the current assignment
- Full context passed to LLM: assignment instructions + student's current code + test results + conversation history
- System prompt constrains LLM to tiered hints, not full code solutions
- 5 hint tiers (one per heart spent):
  - Tier 1: Vague/conceptual nudge
  - Tier 2: Identify the relevant concept
  - Tier 3: Point to the problematic area
  - Tier 4: Specific guidance on approach
  - Tier 5: Near-pseudocode level hint
- Intent guardrail: if student asks for direct answer, redirect with a guiding question
- Streaming responses (token by token)
- Chat preserved while working, archived (read-only) after submission

### 6.9 AI Provider Configuration (P0)
- Default: Groq API key (configured by admin via environment variable)
- Instructor BYOK: optionally add their own key (GPT, Claude, Gemini, Groq, etc.)
- Fallback: if instructor's key fails/rate-limited, fall back to default Groq
- Keys stored server-side (never client-side)
- Provider routing via Vercel AI SDK

### 6.10 Hearts Mechanic (P0)
- Each student starts each assignment with a configurable number of hearts (default: 5)
- One heart consumed per AI tutor message sent
- Hearts regenerate after configurable cooldown (default: 1 heart per 30 minutes), capped at max
- At 0 hearts: chat is read-only (can review previous messages, cannot send new ones)
- UI shows current hearts and time until next regeneration (live timer)
- Hint tier = number of hearts spent on that assignment (linear escalation)

### 6.11 Gamification (P0)

#### XP & Levels
- XP earned from: submitting assignments, passing test cases, perfect score bonus, no-hints bonus, fewer-hints bonus, streak bonus
- Fixed XP values for MVP
- Levels are a progress indicator (XP bar + level number) — no unlocks

#### Badges
- Predefined set (e.g., "First Submit", "Perfect Score", "No Hints Used", "5-Week Streak", "Speed Demon")
- Consistent across all classes

#### Leaderboard
- Ranked by total XP
- Public leaderboard shows top N students with names (N configurable by instructor per class)
- Students can see their own rank even if outside top N
- Instructors see full class ranking

#### Streaks
- Weekly-based: submit at least one assignment per week to maintain streak
- Streak resets if a week is missed

### 6.12 Behavioral Confidence Indicator (P1)
- Track per submission: paste events, typing speed/patterns, time spent in editor
- Show raw signals to instructor per submission (no accusatory score)
- Instructor interprets the data themselves

### 6.13 Instructor Submission View (P0)
- Table of all students' scores for a given assignment
- Click into individual submission to view:
  - Submitted code
  - Per-test-case pass/fail results
  - Student's AI tutor conversation history
  - Behavioral signals (paste events, typing speed, time spent)

### 6.14 Basic Notifications (P1)
- Toast notifications for: assignment submitted successfully, hearts regenerated

---

## 7. User Stories (MVP)

| As a... | I want to... | So that... |
|---|---|---|
| Student | log in and see my assignments per class | I know what's due |
| Student | join a class with a code | I can access my instructor's assignments |
| Student | write and run code in-browser | I don't need a separate IDE |
| Student | see which visible test cases pass when I run | I can check my approach before submitting |
| Student | submit code and see my final score | I know how I did on all test cases |
| Student | ask the AI tutor a question | I get unstuck with a hint, not the answer |
| Student | see progressively better hints as I spend hearts | I get more help when I'm truly stuck |
| Student | see my hearts count and regen timer | I know how much AI help I have left |
| Student | see my XP, level, badges, and streak | I feel motivated to keep going |
| Student | see the class leaderboard | I know where I stand |
| Instructor | create an assignment with visible and hidden test cases | students can self-check and I can auto-grade |
| Instructor | assign work to multiple classes | I don't duplicate effort across sections |
| Instructor | configure hearts and regen per assignment | I can tune difficulty |
| Instructor | view a student's submission, score, and tutor chat | I can assess their understanding |
| Instructor | see behavioral signals per submission | I can identify suspicious submissions |
| Instructor | add my own API key for a different LLM | my class uses a model I prefer |
| Admin | approve instructor signups | only verified faculty get instructor access |
| Admin | configure the default API key | the platform has a working AI tutor out of the box |

---

## 8. Rate Limiting

| Target | Limit | Notes |
|---|---|---|
| Code execution (per student) | 5 runs/min | Prevent spam/abuse |
| Code execution timeout | 10 seconds | Kill infinite loops |
| AI tutor | Hearts mechanic | Pedagogical + cost control |
| General API protection | Post-MVP | Load balancing deferred |

---

## 9. Out-of-Scope for MVP (Future Work)

- Adaptive hint difficulty (Bayesian Knowledge Tracing)
- Plagiarism/similarity detection between students
- Analytics dashboards (usage trends, common errors)
- Configurable XP values
- Custom badges (instructor-created)
- Load balancing / multi-instance scaling
- Password reset / email verification flows
- Mobile-responsive optimization beyond basic usability
- LMS integrations
- Admin panel beyond basic instructor approval and API key config
- Languages beyond Python, C, JavaScript, C#

---

## 10. Success Criteria for MVP

The MVP is "ready for evaluation" when a respondent can complete this full flow without developer intervention:

1. Admin approves an instructor account and configures default API key
2. Instructor logs in → creates a class → creates an assignment with visible + hidden test cases
3. Student logs in → joins class with code → sees the assignment
4. Student writes code in Monaco editor → runs against visible test cases → sees output
5. Student asks AI tutor a question → receives a tiered hint (not code) → sees hearts decrease
6. Student uses all hearts → sees read-only chat + regeneration timer
7. Student submits → sees pass/fail per test case and a score → earns XP + badge
8. Student views leaderboard and their level/streak
9. Instructor views student's submission, score, tutor conversation, and behavioral signals

If all nine steps work end-to-end, the MVP is sufficient for usability/acceptability testing.

---

## 11. Suggested MVP Build Order

1. Project setup (Next.js + Supabase + Prisma + shadcn/ui)
2. Auth + three roles + admin approval flow
3. Database schema (users, classes, assignments, test_cases, submissions, hearts, xp, badges, streaks)
4. Class creation + join code system
5. Instructor: create assignment with visible/hidden test cases + language selection
6. Code editor (Monaco) + Judge0 Cloud API integration
7. Student: view assignment → run code against visible cases
8. Student: submit → auto-grading against all cases (one final submit)
9. AI tutor chat + system prompt guardrail + tiered hints
10. Hearts mechanic (consumption + regeneration + read-only at 0)
11. AI provider config (default Groq + instructor BYOK + fallback)
12. Gamification: XP + levels + badges + leaderboard + streaks
13. Behavioral tracking (paste, typing, time) + instructor view
14. Instructor: view submissions + tutor history + signals
15. Notifications (toasts)
16. Polish UI + basic responsive
17. Deploy to Vercel + configure Judge0 Cloud
18. Pilot test before formal data gathering
