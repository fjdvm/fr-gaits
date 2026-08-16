# 04 — Code Editor + Judge0 Execution (Run)

**What to build:** When a student clicks an assignment, they see the assignment workspace: an instructions pane on one side and a Monaco editor (with syntax highlighting for the assignment's language) plus an output panel on the other. A "Run" button sends the student's code to the Judge0 Cloud API, receives stdout/stderr/status, and displays results. Visible test cases are run and results are shown as pass/fail per case. Rate limiting enforces a maximum of 5 runs per minute per student. Execution timeout is set to 10 seconds via the Judge0 API parameter. Client-side behavioral tracking begins: capture paste events (count + character length), keystroke timing (WPM approximation), and total time with the editor focused. These signals are accumulated in-memory for later submission.

**Blocked by:** 03 — Assignments + Test Cases

**Status:** ready-for-agent

- [ ] Monaco Editor renders in the assignment workspace with syntax highlighting matching the assignment's language
- [ ] Instructions pane displays the assignment title, instructions, and due date
- [ ] "Run" button sends code to Judge0 Cloud API and displays stdout/stderr in the output panel
- [ ] Visible test cases are executed and results shown as pass/fail per case with actual vs expected output
- [ ] Rate limiting: student cannot exceed 5 runs per minute (server-side enforcement with client feedback)
- [ ] Execution timeout set to 10 seconds
- [ ] Behavioral tracking captures paste events, keystroke timing, and editor focus time client-side
- [ ] Assignment status updates to "in progress" once the student opens the workspace
