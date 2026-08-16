# 07 — AI Provider Configuration + Fallback

**What to build:** The default AI provider is Groq, configured via a server-side environment variable. Instructors can optionally add their own LLM API key (supporting GPT, Claude, Gemini, or Groq) in their class settings. The key is stored encrypted in the database and decrypted server-side per request. Fallback logic: attempt the instructor's configured key first — on failure or rate-limit error, automatically retry the request with the default Groq key so students are never blocked. Provider selection is handled via the Vercel AI SDK's provider registry.

**Blocked by:** 06 — AI Tutor Chat + Tiered Hints + Hearts

**Status:** ready-for-agent

- [ ] Default Groq API key loaded from environment variable and works for AI tutor requests
- [ ] Instructor can configure an alternative API key and provider in class settings
- [ ] API keys are stored encrypted in the database and decrypted server-side only
- [ ] Fallback logic: instructor's key attempted first, default Groq used on failure/rate-limit
- [ ] Provider routing uses the Vercel AI SDK provider registry
- [ ] Students experience no interruption if the instructor's key fails
