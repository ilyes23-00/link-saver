# Assessment Gap Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the submission gaps identified against the assessment brief by fixing lifecycle behavior, integration robustness, build correctness, instrumentation quality, and README completeness.

**Architecture:** Keep the current Next.js App Router structure, but move link submission orchestration into a small service layer so route behavior is easier to test and reason about. Use `after()` for non-blocking metadata processing, enrich retry metadata for observability, and update the frontend to reflect asynchronous status changes.

**Tech Stack:** Next.js App Router, TypeScript, Route Handlers, SQLite, Vitest

---

### File Map

- Modify: `package.json` for test scripts and minimal test tooling.
- Modify: `app/api/links/route.ts` to return `pending`, use `after`, and preserve idempotency.
- Create: `lib/linkSubmission.ts` for submission + processing orchestration.
- Modify: `lib/metadata.ts` and `lib/retry.ts` to support retry-aware metadata fetching and `Retry-After`.
- Modify: `lib/linkRepository.ts` and `types/link.ts` for stronger typing.
- Modify: `app/page.tsx` and `components/UrlForm.tsx` so async statuses surface in the UI.
- Modify: `README.md` and `link-saver/README.md` so the submission docs satisfy the brief.
- Create: minimal tests covering retry semantics and submission lifecycle.

### Execution Notes

- [ ] Add a minimal test setup and write failing tests for retry behavior and async submission lifecycle.
- [ ] Run the new tests to confirm they fail for the expected reasons.
- [ ] Implement the smallest code changes needed to make the tests pass.
- [ ] Update route handling, polling behavior, and instrumentation payloads to satisfy the brief.
- [ ] Replace placeholder README content with assessment-grade documentation.
- [ ] Run `npm test`, `npm run lint`, and `npm run build`.
