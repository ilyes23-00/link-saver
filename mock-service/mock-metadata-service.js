/**
 * ============================================================================
 *  Mock Metadata Service  -  WAct technical assessment (Part 2B)
 * ============================================================================
 *
 *  A deliberately UNRELIABLE third-party API, so we can see how you build a
 *  real-world integration. Treat it like a flaky external service in prod.
 *
 *  RUN IT:
 *      node mock-metadata-service.js
 *  (No dependencies. Node 18+. Listens on http://localhost:4000)
 *
 *  ENDPOINTS
 *  ---------
 *  GET  /health
 *      Always 200 { ok: true }. Use it to check the server is up.
 *
 *  GET  /metadata?url=<encoded-url>
 *      The main endpoint. Given a URL, returns its metadata - MOST of the time.
 *      On any given call it will randomly do one of:
 *        - ~55%  200 OK  { url, title, description, fetchedAt }  (after a delay)
 *        -  ~25% 500 Internal Server Error   { error: "upstream_error" }
 *        -  ~10% 429 Too Many Requests       { error: "rate_limited" }  + Retry-After header
 *        -  ~10% (timeout) hangs for 30s before responding - your client
 *                should give up well before that.
 *
 *  POST /metadata/async        (only needed for the optional BONUS)
 *      Body: { "url": "...", "callbackUrl": "http://localhost:3000/api/webhook" }
 *      Responds 202 immediately, then ~1-3s later POSTs the metadata (or an
 *      error payload) to your callbackUrl.
 *
 *  TUNE THE CHAOS (optional env vars):
 *      FAILURE_RATE=0.25 RATE_LIMIT_RATE=0.10 TIMEOUT_RATE=0.10 MAX_DELAY_MS=800
 *      e.g.  FAILURE_RATE=0 TIMEOUT_RATE=0 node mock-metadata-service.js   (calm mode)
 * ============================================================================
 */

const http = require("http");

const PORT = Number(process.env.PORT || 4000);
const FAILURE_RATE = Number(process.env.FAILURE_RATE ?? 0.25); // 500s
const RATE_LIMIT_RATE = Number(process.env.RATE_LIMIT_RATE ?? 0.1); // 429s
const TIMEOUT_RATE = Number(process.env.TIMEOUT_RATE ?? 0.1); // hangs
const MAX_DELAY_MS = Number(process.env.MAX_DELAY_MS ?? 800); // success latency

const SAMPLE_TITLES = [
  "The Pragmatic Engineer",
  "How We Built It",
  "A Field Guide to Webhooks",
  "Designing Resilient Systems",
  "Notes on Idempotency",
  "Retry, Backoff, and You",
];
const SAMPLE_DESCRIPTIONS = [
  "A practical look at building software that survives contact with reality.",
  "Lessons from shipping a small product with a very small team.",
  "Everything you wish you'd known before integrating a third-party API.",
  "Why the happy path is the easy 20% of the work.",
];

const JSON_HEADERS = { "Content-Type": "application/json" };
const rand = () => Math.random();
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Derive stable-ish fake metadata from the URL so repeat calls look consistent.
function metadataFor(targetUrl) {
  let hash = 0;
  for (let i = 0; i < targetUrl.length; i++) {
    hash = (hash * 31 + targetUrl.charCodeAt(i)) >>> 0;
  }
  return {
    url: targetUrl,
    title: SAMPLE_TITLES[hash % SAMPLE_TITLES.length],
    description: SAMPLE_DESCRIPTIONS[hash % SAMPLE_DESCRIPTIONS.length],
    fetchedAt: new Date().toISOString(),
  };
}

function send(res, status, body, extraHeaders = {}) {
  res.writeHead(status, { ...JSON_HEADERS, ...extraHeaders });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function postToCallback(callbackUrl, payload) {
  try {
    const u = new URL(callbackUrl);
    const body = JSON.stringify(payload);
    const req = http.request({
      method: "POST",
      hostname: u.hostname,
      port: u.port || 80,
      path: u.pathname + u.search,
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    });
    req.on("error", (e) => console.log("  callback failed:", e.message));
    req.end(body);
  } catch (e) {
    console.log("  bad callbackUrl:", e.message);
  }
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && u.pathname === "/health") {
    return send(res, 200, { ok: true });
  }

  if (req.method === "GET" && u.pathname === "/metadata") {
    const target = u.searchParams.get("url");
    if (!target) return send(res, 400, { error: "missing 'url' query param" });

    const roll = rand();
    if (roll < TIMEOUT_RATE) {
      // Simulate a timeout: hang for 30s. Your client should bail long before this.
      console.log(`[timeout]      ${target}`);
      await delay(30000);
      return send(res, 200, metadataFor(target)); // (almost certainly never reached by the client)
    }
    if (roll < TIMEOUT_RATE + RATE_LIMIT_RATE) {
      console.log(`[429]          ${target}`);
      return send(res, 429, { error: "rate_limited" }, { "Retry-After": "2" });
    }
    if (roll < TIMEOUT_RATE + RATE_LIMIT_RATE + FAILURE_RATE) {
      console.log(`[500]          ${target}`);
      return send(res, 500, { error: "upstream_error" });
    }
    await delay(rand() * MAX_DELAY_MS);
    console.log(`[200]          ${target}`);
    return send(res, 200, metadataFor(target));
  }

  if (req.method === "POST" && u.pathname === "/metadata/async") {
    const { url: target, callbackUrl } = await readBody(req);
    if (!target || !callbackUrl) {
      return send(res, 400, { error: "body must include 'url' and 'callbackUrl'" });
    }
    send(res, 202, { status: "accepted" });
    const ms = 1000 + rand() * 2000;
    setTimeout(() => {
      const ok = rand() > 0.2;
      console.log(`[async->cb ${ok ? "ok" : "err"}] ${target}`);
      postToCallback(callbackUrl, ok ? metadataFor(target) : { url: target, error: "upstream_error" });
    }, ms);
    return;
  }

  return send(res, 404, { error: "not_found" });
});

server.listen(PORT, () => {
  console.log(`Mock Metadata Service running on http://localhost:${PORT}`);
  console.log(`  GET /health   GET /metadata?url=...   POST /metadata/async`);
  console.log(
    `  chaos: failure=${FAILURE_RATE} rateLimit=${RATE_LIMIT_RATE} timeout=${TIMEOUT_RATE}\n`
  );
});
