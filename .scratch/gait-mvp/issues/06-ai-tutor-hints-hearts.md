# 06 — AI Tutor Chat + Tiered Hints + Hearts

**What to build:** Create `hearts_state` and `chat_messages` tables. Add a chat panel to the assignment workspace (alongside the editor). When the student sends a message, the system constructs a prompt that includes: the assignment instructions, the student's current code, test results from their last run, and the full conversation history. A system prompt enforces tiered hint behavior based on the number of hearts already spent (tier 1: vague conceptual nudge → tier 5: near-pseudocode hint). An intent guardrail in the system prompt detects requests for direct answers and redirects with Socratic questions. Each message sent decrements the student's heart count for that assignment. Responses stream token-by-token to the client via the Vercel AI SDK. At 0 hearts, the chat becomes read-only (student can review previous messages but cannot send new ones) and a live regeneration timer is displayed. Hearts regenerate server-side: elapsed time since last regeneration divided by the assignment's cooldown, capped at the max hearts. Chat becomes read-only after assignment submission.

**Blocked by:** 04 — Code Editor + Judge0 Execution (Run)

**Status:** ready-for-agent

- [ ] Prisma schema adds `hearts_state` (student_id, assignment_id, current_count, last_regen_at, total_spent) and `chat_messages` (id, student_id, assignment_id, role, content, created_at) tables; migration runs
- [ ] Chat panel renders in the assignment workspace alongside the editor
- [ ] System prompt includes assignment instructions, student's current code, last run test results, and conversation history
- [ ] Hint tier escalates based on total hearts spent (tier 1–5 with progressively more specific hints)
- [ ] Intent guardrail detects direct-answer requests and responds with guiding questions instead
- [ ] Each chat message sent decrements hearts and the UI reflects the current count
- [ ] AI responses stream token-by-token to the client
- [ ] At 0 hearts: chat input is disabled, previous messages are readable, and a live regeneration timer shows time until next heart
- [ ] Hearts regenerate server-side per the assignment's configured cooldown, capped at max
- [ ] Chat is read-only after assignment submission
