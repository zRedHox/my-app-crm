#!/usr/bin/env node
/**
 * Run on server: node scripts/check-line-env.cjs
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.production");

if (!fs.existsSync(envPath)) {
  console.error("MISSING:", envPath);
  console.error("Run: cp .env.example .env.production && nano .env.production");
  process.exit(1);
}

const vars = {};
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i <= 0) continue;
  vars[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

for (const k of [
  "LINE_CHANNEL_ACCESS_TOKEN",
  "LINE_CHANNEL_SECRET",
  "NEXT_PUBLIC_APP_URL",
]) {
  console.log(k + ":", vars[k] ? "OK" : "MISSING");
}

const ok = ["LINE_CHANNEL_ACCESS_TOKEN", "LINE_CHANNEL_SECRET"].every((k) => vars[k]);
process.exit(ok ? 0 : 1);
