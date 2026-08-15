import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the ChronoFlags product", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>ChronoFlags — Historical flag keyboard<\/title>/i);
  assert.match(html, /History, at your/);
  assert.match(html, /The Chrono keyboard/);
  assert.match(html, /A visual archive/);
  assert.match(html, /manifest\.webmanifest/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("ships a sourced offline catalog", async () => {
  const [data, manifest, serviceWorker, attribution] = await Promise.all([
    readFile(new URL("../app/flag-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
    readFile(new URL("../ATTRIBUTION.md", import.meta.url), "utf8"),
  ]);
  for (const id of [
    "holy-roman-empire",
    "german-empire",
    "nazi-germany",
    "kingdom-italy",
    "franco-spain",
    "gold-coast",
  ]) {
    assert.match(data, new RegExp(`id: "${id}"`));
  }
  assert.match(manifest, /"display": "standalone"/);
  assert.match(serviceWorker, /chronoflags-v1/);
  assert.match(attribution, /Wikimedia Commons source record/);
  await Promise.all(
    ["hre", "german-empire", "nazi-germany", "kingdom-italy", "franco-spain", "gold-coast"].map(
      (name) => access(new URL(`../public/flags/${name}.svg`, import.meta.url)),
    ),
  );
  await access(new URL("../public/og.png", import.meta.url));
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
