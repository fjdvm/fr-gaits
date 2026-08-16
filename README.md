# GAITS — Gamified AI-Assisted Integrated Tutoring System

![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase)
![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-7-black?logo=vercel)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000)
![Judge0](https://img.shields.io/badge/Judge0-Code%20Execution-green)
![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel%20(sin1)-black?logo=vercel)
![License](https://img.shields.io/badge/License-Private-red)

---

## Problem Statement

Traditional programming education lacks:

- **Real-time, personalized guidance** — students get stuck without immediate help
- **Safeguards against plagiarism** — students can easily copy-paste solutions from AI tools
- **Engagement mechanics** — assignments feel repetitive with no progression or reward
- **Scalability** — instructors cannot provide 1-on-1 help to dozens of students simultaneously

---

## Solution

GAITS is a gamified web platform that integrates:

1. **AI Tutor with Tiered Hints** — a hearts-gated, Socratic AI assistant that progressively reveals more detailed guidance as students invest effort
2. **Secure Code Execution** — sandboxed Judge0 environment for running and grading code against visible and hidden test cases
3. **Behavioral Signal Tracking** — monitors paste frequency, keystrokes, typing speed, and focus time to detect academic dishonesty
4. **Gamification Engine** — XP, levels, badges, streaks, and class leaderboards to drive engagement
5. **Role-Based Access** — students, instructors, and admins each with dedicated dashboards and capabilities

---

## App Design

### User Roles & Flows

| Role | Capabilities |
|------|-------------|
| **Student** | Join classes, view assignments, write code in Monaco editor, run tests, chat with AI tutor, submit solutions, earn XP/badges, view leaderboard |
| **Instructor** | Create classes (with join codes), create assignments with test cases, configure AI provider per class, view submissions and scores |
| **Admin** | Approve instructor accounts, manage system-wide AI API keys |

### Key Pages

- `/login`, `/signup` — Authentication with role selection
- `/dashboard/student` — Assignment list, XP/level progress, join class
- `/dashboard/student/assignments/[id]` — Full workspace (editor + AI chat + instructions)
- `/dashboard/student/leaderboard` — Class rankings
- `/dashboard/instructor` — Class management, assignment creation
- `/dashboard/instructor/submissions` — Grade overview and detailed submission view
- `/dashboard/admin` — Instructor approvals and API key settings

### Student Data Flow

```mermaid
flowchart TD
    A[Student Login] --> B[Student Dashboard]
    B --> C[Join Class via Code]
    B --> D[View Assignments]
    B --> E[View Leaderboard]
    D --> F[Open Workspace]
    F --> G[Write Code in Editor]
    F --> H[Chat with AI Tutor]
    H --> I{Hearts Available?}
    I -->|Yes| J[Deduct Heart + Send Message]
    J --> K[Receive Tiered Hint via Stream]
    I -->|No| L[Wait for Regeneration]
    G --> M[Run Code - Visible Tests]
    M --> N[View Results in Console]
    G --> O[Submit Code - All Tests]
    O --> P[Calculate Score]
    P --> Q[Award XP]
    Q --> R[Check Badges]
    R --> S[Update Streak]
    S --> T[Update Leaderboard Position]
```

### Instructor Data Flow

```mermaid
flowchart TD
    A[Instructor Login] --> B{Account Approved?}
    B -->|No| C[Pending Approval Page]
    B -->|Yes| D[Instructor Dashboard]
    D --> E[Create Class]
    E --> F[Generate Join Code]
    D --> G[Create Assignment]
    G --> H[Set Instructions + Language]
    H --> I[Add Test Cases]
    I --> J[Set Visible / Hidden]
    G --> K[Configure Hearts + Regen Time]
    D --> L[Configure AI Provider]
    L --> M[Select Provider + Enter API Key]
    M --> N[Encrypt + Store Key]
    D --> O[View Submissions]
    O --> P[View Assignment Scores Table]
    P --> Q[View Individual Submission Detail]
    Q --> R[See Code + Score + Behavioral Signals]
```

### Admin Data Flow

```mermaid
flowchart TD
    A[Admin Login] --> B[Admin Dashboard]
    B --> C[View Pending Instructors]
    C --> D[Review Instructor Request]
    D --> E{Approve?}
    E -->|Yes| F[Set Status to Approved]
    E -->|No| G[Reject Request]
    B --> H[System Settings]
    H --> I[Manage AI API Keys]
    I --> J[Add/Update Groq Key]
    I --> K[Add/Update Google Key]
    J --> L[Encrypt with AES-256-GCM]
    K --> L
    L --> M[Store in SystemSetting Table]
    M --> N[Available as Fallback for All Classes]
```

---

## Architecture Design

### High-Level System Architecture

```mermaid
graph TB
    subgraph Client["Browser (React 19)"]
        UI[Next.js App Router + shadcn/ui]
        Editor[Monaco Code Editor]
        Chat[AI Chat Panel - useChat hook]
    end

    subgraph Vercel["Vercel (sin1 region)"]
        Pages[Server Components / Pages]
        Actions[Server Actions]
        API[API Route - /api/chat]
        MW[Middleware - Auth Guard]
    end

    subgraph External["External Services"]
        Supabase[(Supabase PostgreSQL + Auth)]
        Judge0[Judge0 Cloud API]
        LLM[LLM Providers]
    end

    UI --> Pages
    Editor --> Actions
    Chat -->|SSE Stream| API
    MW --> Pages
    MW --> Actions
    Pages --> Supabase
    Actions --> Supabase
    Actions --> Judge0
    API --> Supabase
    API -->|streamText| LLM

    LLM -->|Groq - llama-3.3-70b| API
    LLM -->|OpenAI - gpt-4o-mini| API
    LLM -->|Anthropic - claude-3.5-haiku| API
    LLM -->|Google - gemini-1.5-flash| API
```

### Database Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Enrollment : enrolls
    User ||--o{ Classroom : creates
    User ||--o{ Submission : submits
    User ||--o{ ChatMessage : sends
    User ||--o{ HeartsState : has
    User ||--o{ XpEvent : earns
    User ||--o{ UserBadge : achieves
    User ||--|| Streak : maintains

    Classroom ||--o{ Enrollment : contains
    Classroom ||--o{ AssignmentClass : links

    Assignment ||--o{ AssignmentClass : links
    Assignment ||--o{ TestCase : has
    Assignment ||--o{ HeartsState : tracks
    Assignment ||--o{ Submission : receives
    Assignment ||--o{ ChatMessage : contains

    Badge ||--o{ UserBadge : awarded

    User {
        string id PK
        string email
        string role
        string approvalStatus
        datetime createdAt
    }

    Classroom {
        string id PK
        string name
        string instructorId FK
        string joinCode UK
        string aiProvider
        string aiApiKeyEnc
        int leaderboardSize
    }

    Assignment {
        string id PK
        string title
        text instructions
        string language
        datetime dueDate
        int heartsCount
        int heartsRegenMinutes
        string createdBy FK
    }

    TestCase {
        string id PK
        string assignmentId FK
        text input
        text expectedOutput
        boolean visible
    }

    Submission {
        string id PK
        string studentId FK
        string assignmentId FK
        text code
        float score
        json testResults
        json behavioralSignals
        datetime submittedAt
    }

    HeartsState {
        string studentId PK
        string assignmentId PK
        int currentCount
        datetime lastRegenAt
        int totalSpent
    }

    ChatMessage {
        string id PK
        string studentId FK
        string assignmentId FK
        string role
        text content
        datetime createdAt
    }

    XpEvent {
        string id PK
        string studentId FK
        string eventType
        int xpAmount
        string assignmentId
    }

    Badge {
        string id PK
        string name UK
        string description
        string condition
    }

    Streak {
        string studentId PK
        int currentStreak
        int lastSubmissionWeek
    }
```

### Request Flow — AI Tutor Chat

```mermaid
sequenceDiagram
    participant S as Student Browser
    participant API as /api/chat
    participant DB as PostgreSQL
    participant LLM as LLM Provider

    S->>API: POST {assignmentId, message, currentCode, lastRunResults}
    API->>DB: Verify auth + check submission status
    API->>DB: getOrRegenerateHearts()
    alt Hearts > 0
        API->>DB: Deduct 1 heart
        API->>DB: Save user message
        API->>DB: Fetch full chat history
        API->>LLM: streamText(systemPrompt + history)
        LLM-->>S: SSE token stream (real-time)
        LLM-->>API: onFinish(fullText)
        API->>DB: Save assistant message
    else Hearts = 0
        API-->>S: 403 "No hearts remaining"
    end
```

### Request Flow — Code Execution & Submission

```mermaid
sequenceDiagram
    participant S as Student Browser
    participant SA as Server Action
    participant DB as PostgreSQL
    participant J as Judge0 Cloud

    S->>SA: submitCode(assignmentId, code, behavioralSignals)
    SA->>DB: Verify auth, no prior submission, not past due
    SA->>DB: Fetch ALL test cases (visible + hidden)
    loop Each Test Case
        SA->>J: POST /submissions {source_code, stdin, expected_output}
        J-->>SA: {stdout, stderr, compile_output, status}
    end
    SA->>SA: Compare outputs, calculate score
    SA->>DB: Create Submission record
    SA->>SA: awardSubmissionXp(score, hintsUsed)
    SA->>DB: Create XpEvent records
    SA->>DB: Check & award badges
    SA->>DB: Update streak
    SA-->>S: {score, testResults}
```

---

## Detailed Framework Diagram

```mermaid
graph LR
    subgraph Frontend["Frontend Layer"]
        direction TB
        NextApp[Next.js 16 App Router]
        ShadcnUI[shadcn/ui Components]
        Monaco[Monaco Editor]
        AIChat[useChat - @ai-sdk/react]
        TailwindCSS[Tailwind CSS v4]
    end

    subgraph Backend["Backend Layer"]
        direction TB
        ServerActions[Server Actions]
        APIRoutes[API Routes]
        Middleware[Auth Middleware]
        PrismaORM[Prisma ORM v7]
    end

    subgraph Services["External Services"]
        direction TB
        SupabaseAuth[Supabase Auth]
        SupabaseDB[(Supabase PostgreSQL)]
        Judge0API[Judge0 Cloud CE]
        GroqAI[Groq - Llama 3.3 70B]
        GoogleAI[Google - Gemini 1.5 Flash]
        OpenAI[OpenAI - GPT-4o Mini]
        AnthropicAI[Anthropic - Claude 3.5 Haiku]
    end

    subgraph Security["Security Layer"]
        direction TB
        AES[AES-256-GCM Encryption]
        RateLimit[Rate Limiting - 5 req/min]
        RoleGuard[Role-Based Access Control]
        IntentGuard[AI Intent Guardrail]
    end

    Frontend --> Backend
    Backend --> Services
    Security -.-> Backend
```

---

## Algorithms

### 1. Tiered Hint Algorithm

The AI tutor uses a progressive disclosure model based on hearts spent:

```mermaid
flowchart TD
    A[Student sends message] --> B{Hearts > 0?}
    B -->|No| C[Reject - 403]
    B -->|Yes| D[Deduct 1 heart]
    D --> E[Calculate tier = min 5 max 1 totalSpent]
    E --> F{Tier Level}
    F -->|Tier 1| G[Vague conceptual nudge]
    F -->|Tier 2| H[General strategy hint]
    F -->|Tier 3| I[Specific logic step-by-step]
    F -->|Tier 4| J[Structural outline with control flow]
    F -->|Tier 5| K[Near-pseudocode translation]
    G & H & I & J & K --> L[Append to system prompt]
    L --> M[Stream response with Socratic guardrail]
    M --> N{Student asks for full solution?}
    N -->|Yes| O[Reject - ask Socratic questions instead]
    N -->|No| P[Deliver hint at tier level]
```

### 2. Hearts Regeneration Algorithm

```
function getOrRegenerateHearts(studentId, assignmentId):
    state = DB.find(studentId, assignmentId)
    if state is null:
        state = DB.create(studentId, assignmentId, count=maxHearts)
        return state

    if state.currentCount >= maxHearts:
        return state

    elapsed = now() - state.lastRegenAt
    cooldown = assignment.heartsRegenMinutes * 60 * 1000
    heartsToRestore = floor(elapsed / cooldown)

    if heartsToRestore > 0:
        newCount = min(maxHearts, state.currentCount + heartsToRestore)
        state.currentCount = newCount
        state.lastRegenAt = lastRegenAt + (heartsToRestore * cooldown)
        DB.update(state)

    return state
```

### 3. XP Award Algorithm

```
function awardSubmissionXp(student, assignment, score, hintsUsed):
    xpEvents = []

    // Proportional XP for passing test cases
    if score > 0:
        caseXp = round((score / 100) * 50)
        xpEvents.push({type: "pass_case", amount: caseXp})

    // Perfect score bonus
    if score == 100:
        xpEvents.push({type: "perfect_score", amount: 50})

    // Hint efficiency bonuses
    if hintsUsed == 0:
        xpEvents.push({type: "no_hints", amount: 30})
    else if hintsUsed <= 2:
        xpEvents.push({type: "few_hints", amount: 15})

    // Streak bonus (weekly cadence)
    currentWeek = getISOWeek(now())
    if streak.lastSubmissionWeek == currentWeek - 1:
        streak.currentStreak += 1
        xpEvents.push({type: "streak", amount: 20})
    else if streak.lastSubmissionWeek != currentWeek:
        streak.currentStreak = 1

    // Badge checks
    checkAndAwardBadges(student, totalXp, streak, submissions)

    return xpEvents
```

### 4. Code Execution Scoring Algorithm

```
function scoreSubmission(code, language, testCases):
    results = []
    for each testCase in testCases:
        response = Judge0.submit({
            source_code: code,
            language_id: LANGUAGE_MAP[language],
            stdin: testCase.input,
            expected_output: testCase.expectedOutput,
            cpu_time_limit: 10
        })

        passed = normalize(response.stdout) == normalize(testCase.expectedOutput)
        results.push({testCase, passed, stdout, stderr, compileOutput})

    score = (results.filter(r => r.passed).length / results.length) * 100
    return {score, results}

function normalize(output):
    return output.trim().replaceAll("\r\n", "\n")
```

### 5. AI Provider Fallback Algorithm

```mermaid
flowchart TD
    A[Request arrives] --> B[Lookup assignment's class]
    B --> C{Class has AI provider configured?}
    C -->|Yes| D[Decrypt instructor's API key]
    D --> E{Key valid?}
    E -->|Yes| F[Use instructor's provider]
    E -->|No| G[Fallback to default]
    C -->|No| G
    G --> H{GROQ_API_KEY env set?}
    H -->|Yes| I[Use Groq - llama-3.3-70b]
    H -->|No| J{GOOGLE_AI_KEY env set?}
    J -->|Yes| K[Use Google - gemini-1.5-flash]
    J -->|No| L[Check SystemSetting table]
    L --> M{Admin keys found?}
    M -->|Yes| N[Use first valid admin key]
    M -->|No| O[Error: No AI key configured]
```

---

## Gamification Design

### Level Progression

| Level | XP Required | Cumulative |
|-------|-------------|------------|
| 1 | 0 | 0 |
| 2 | 100 | 100 |
| 3 | 250 | 250 |
| 4 | 500 | 500 |
| 5 | 800 | 800 |
| 6 | 1,200 | 1,200 |
| 7 | 1,700 | 1,700 |
| 8 | 2,300 | 2,300 |
| 9 | 3,000 | 3,000 |
| 10 | 4,000 | 4,000 |
| 11 | 5,000 | 5,000 |

### Badges

| Badge | Condition |
|-------|-----------|
| First Submit | Complete first assignment submission |
| Perfect Score | Score 100% on any assignment |
| Five Perfect | Score 100% on 5 assignments |
| Streak 5 | Maintain 5-week submission streak |
| Streak 10 | Maintain 10-week submission streak |
| XP 1000 | Accumulate 1,000 total XP |
| XP 5000 | Accumulate 5,000 total XP |

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui |
| Code Editor | Monaco Editor (@monaco-editor/react) |
| AI Chat | Vercel AI SDK (useChat + streamText) |
| Backend | Next.js Server Actions + API Routes |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 7 (with @prisma/adapter-pg) |
| Auth | Supabase Auth (email/password + role metadata) |
| Code Execution | Judge0 Cloud API (sandboxed) |
| AI Providers | Groq, OpenAI, Anthropic, Google (multi-provider with fallback) |
| Encryption | AES-256-GCM (for API keys at rest) |
| Deployment | Vercel (Singapore region) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or Supabase project)
- Judge0 Cloud API access
- At least one LLM API key (Groq recommended)

### Environment Variables

Copy `.env.example` and fill in:

```bash
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SERVICE_ROLE_KEY=
ENCRYPTION_KEY=
GROQ_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
JUDGE0_API_KEY=
```

### Development

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npx prisma generate && next build
```

---

## Project Structure

```
fr-gaits/
├── app/
│   ├── layout.tsx              # Root layout (fonts, Toaster)
│   ├── page.tsx                # Root redirect
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   ├── pending-approval/       # Instructor waiting page
│   ├── dashboard/
│   │   ├── student/            # Student dashboard + workspace
│   │   ├── instructor/         # Instructor dashboard + submissions
│   │   └── admin/              # Admin dashboard + settings
│   ├── actions/                # Server actions
│   └── api/chat/               # AI tutor streaming endpoint
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   └── features/               # Domain feature components
├── lib/                        # Core utilities (prisma, AI, auth, gamification)
├── prisma/schema.prisma        # Database schema
├── proxy.ts                    # Auth middleware
└── vercel.json                 # Deployment config
```
