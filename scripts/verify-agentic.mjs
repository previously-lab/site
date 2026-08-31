#!/usr/bin/env node
/**
 * Agentic-readiness endpoint checks (Vercel "Is Agentic" fixes).
 * Run: node scripts/verify-agentic.mjs [baseUrl]   (default http://localhost:3000)
 *
 * Requires a running server (pnpm start after pnpm build, or pnpm dev).
 * Covers: real 404 with recovery links, markdown content negotiation with
 * Vary: Accept, llms.txt when-to-use section, openapi.json, trust anchor
 * pages, and homepage og:image / og:type.
 */

import assert from "node:assert/strict";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

async function get(path, headers = {}) {
  const res = await fetch(`${base}${path}`, {
    headers,
    redirect: "follow",
  });
  return { status: res.status, headers: res.headers, body: await res.text() };
}

/* ---- 1. Agent-friendly 404 ---- */
{
  const res = await get("/some-path-that-does-not-exist");
  assert.equal(res.status, 404, "nonexistent path must return 404");
  assert.ok(res.body.includes("/llms.txt"), "404 body should link llms.txt");
  assert.ok(res.body.includes("/sitemap.xml"), "404 body should link sitemap");
  assert.ok(
    res.body.includes("/docs/introduction"),
    "404 body should link docs index",
  );
}

/* ---- 2. Markdown content negotiation (acceptmarkdown.com) ---- */
{
  // Docs page: Accept: text/markdown → raw markdown variant
  const md = await get("/en/docs/introduction", {
    Accept: "text/markdown",
  });
  assert.equal(md.status, 200);
  assert.match(
    md.headers.get("content-type") ?? "",
    /text\/markdown/,
    "docs page must serve markdown when asked",
  );
  assert.match(
    (md.headers.get("vary") ?? "").toLowerCase(),
    /accept/,
    "markdown variant must carry Vary: Accept",
  );

  // Same URL, normal browser Accept → HTML variant, also declaring variance
  const html = await get("/en/docs/introduction", {
    Accept: "text/html,application/xhtml+xml",
  });
  assert.match(html.headers.get("content-type") ?? "", /text\/html/);
  assert.match(
    (html.headers.get("vary") ?? "").toLowerCase(),
    /accept/,
    "HTML variant must carry Vary: Accept",
  );

  // Homepage → llms.txt as markdown
  const home = await get("/en", { Accept: "text/markdown" });
  assert.match(home.headers.get("content-type") ?? "", /text\/(markdown|plain)/);
  assert.ok(home.body.includes("# Previously Lab"));

  // Root "/" with Accept: text/markdown must serve markdown directly,
  // no redirect hop (some checkers don't preserve Accept across a 307).
  const root = await fetch(`${base}/`, {
    headers: { Accept: "text/markdown" },
    redirect: "manual",
  });
  assert.equal(root.status, 200, "root markdown must not redirect");
  assert.match(root.headers.get("content-type") ?? "", /text\/(markdown|plain)/);
}

/* ---- 2b. Unprefixed trust pages serve directly (no 307) ---- */
for (const path of ["/about", "/contact", "/privacy"]) {
  const res = await fetch(`${base}${path}`, { redirect: "manual" });
  assert.equal(res.status, 200, `${path} must serve without redirect`);
  assert.ok((await res.text()).length > 2000, `${path} needs content`);
}

/* ---- 3. llms.txt when-to-use ---- */
{
  const res = await get("/llms.txt");
  assert.equal(res.status, 200);
  assert.match(res.body, /## When to use this/);
  assert.match(res.body, /\/openapi\.json/);
}

/* ---- 4. OpenAPI spec ---- */
{
  const res = await get("/openapi.json");
  assert.equal(res.status, 200);
  const spec = JSON.parse(res.body);
  assert.equal(spec.openapi, "3.1.0");
  const post = spec.paths?.["/api/playground"]?.post;
  assert.ok(post, "spec must describe POST /api/playground");
  assert.equal(post.operationId, "runPlaygroundPreset");
  assert.ok(post.responses["429"], "spec must document the 429 rate limit");
}

/* ---- 5. Trust anchor pages ---- */
for (const [path, marker] of [
  ["/en/about", "Previously Lab"],
  ["/en/contact", "mailto:a@ldwid.com"],
  ["/en/privacy", "Privacy"],
]) {
  const res = await get(path);
  assert.equal(res.status, 200, `${path} must exist`);
  assert.ok(res.body.length > 2000, `${path} needs substantial content`);
  assert.ok(res.body.includes(marker), `${path} should mention ${marker}`);
}
for (const path of ["/zh/about", "/zh/contact", "/zh/privacy"]) {
  const res = await get(path);
  assert.equal(res.status, 200, `${path} must exist`);
}

/* ---- 6. Homepage metadata: og:image + og:type ---- */
{
  const res = await get("/en");
  assert.match(res.body, /<meta property="og:image"/, "homepage needs og:image");
  assert.match(res.body, /<meta property="og:type"/, "homepage needs og:type");
  assert.match(res.body, /"contactPoint"/, "Organization JSON-LD needs contactPoint");
}

console.log("agentic endpoint checks passed against", base);
