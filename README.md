# WAct Founding Engineer Assessment - Link Saver

## Overview

Link Saver is a small save-for-later app built with `Next.js App Router`, `TypeScript`, and `Next.js Route Handlers`. A user submits a URL, the backend persists it immediately, then enriches it with metadata from the provided flaky Metadata Service while the UI reflects `pending`, `fetching`, `done`, and `failed` states.

## Architecture

- `link-saver/app/api/links/route.ts`
  Handles link submission and listing through Next.js Route Handlers.
- `link-saver/lib/linkSubmission.ts`
  Owns the core submission flow: dedupe, persistence, background processing, status transitions, and event emission.
- `link-saver/lib/metadata.ts`
  Integrates with the mock Metadata Service and applies timeouts plus retry-aware error handling.
- `link-saver/lib/retry.ts`
  Implements retries with exponential backoff and honors `Retry-After` when the upstream rate-limits.
- `link-saver/lib/db.ts` and `link-saver/lib/linkRepository.ts`
  Persist links, metadata, statuses, and errors in SQLite.
- `link-saver/app/page.tsx` and `link-saver/components/*`
  Render the dashboard and poll while links are still processing so async state changes appear in the UI.

## Key Decisions

- Chose SQLite because the brief explicitly prioritizes logic over infrastructure setup, and SQLite keeps local verification fast.
- Returned new submissions immediately as `202 Accepted` with `pending` status, then processed metadata with `after()`, so the UI can show the full lifecycle instead of blocking until enrichment finishes.
- Kept idempotency strict at the URL level by checking existing rows first and also relying on the database unique constraint as a backstop.
- Used structured `console.log` instrumentation rather than a real analytics SDK, because the brief said stub events were enough.

## Tradeoffs

- URL uniqueness is exact-string based. This keeps the implementation simple and predictable for the timebox, but it does not normalize semantically equivalent URLs.
- The dashboard uses lightweight polling while links are `pending` or `fetching`. For a production system I would prefer server push, background jobs, or the optional webhook path.
- Metadata processing stays inside the application runtime rather than a dedicated queue worker. That is acceptable for the assessment scope, but not the long-term scaling path.

## Assumptions

- The metadata service is the system of record for title and description enrichment.
- Exact URL string match is sufficient for idempotency in the assessment scope.
- A failed metadata fetch should keep the original saved link and persist the failure reason for later inspection.
- Console-based events are enough to demonstrate product instrumentation.

## Reliability Notes

- Timeout handling: metadata requests abort after 5 seconds.
- Retry handling: upstream failures retry with exponential backoff.
- Rate limiting: `429` responses honor the service's `Retry-After` header.
- Idempotency: submitting the same URL returns the existing row and does not schedule a second metadata fetch.
- Persistence: link records, metadata, statuses, and failure messages are all stored in SQLite.

## Tracking Plan

| Event | Properties | Why it matters |
| --- | --- | --- |
| `link_submitted` | `linkId`, `url`, `deduped`, `status` | Measures save intent and shows whether users are adding new links or revisiting existing ones. |
| `link_processed` | `linkId`, `url`, `status`, `attemptCount`, `durationMs` | Measures enrichment success, retry pressure, and end-to-end processing latency. |
| `metadata_fetch_failed` | `linkId`, `url`, `status`, `error`, `durationMs` | Identifies upstream failure modes and shows whether failed links come from timeouts, rate limits, or server errors. |

## What I'd Do Next

- Add URL normalization so common variants of the same page dedupe cleanly.
- Add the optional async webhook path from the brief and compare it with the polling approach.
- Introduce a proper background job system for metadata processing instead of keeping it inside the request-serving runtime.
- Expand automated coverage around repository/database integration and UI lifecycle behavior.

## Run Instructions

### 1. Install dependencies

From the workspace root:

```bash
cd link-saver
npm install
cd ../mock-service
npm install
```

### 2. Start the mock Metadata Service

```bash
cd mock-service
node mock-metadata-service.js
```

The service runs on `http://localhost:4000`.

### 3. Start the app

In a second terminal:

```bash
cd link-saver
npm run dev
```

The app runs on `http://localhost:3000`.

### 4. Verify the app

- Submit a fresh URL and observe it enter `pending`, then `fetching`, then `done` or `failed`.
- Submit the same URL again and confirm the existing row is returned without duplication.
- Check the server logs for the three structured tracking events.

### 5. Verification commands

```bash
cd link-saver
npm test
npm run lint
npm run build
```

## Linear Board

- Replace this line with your actual Linear board URL before submission.
