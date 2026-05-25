/**
 * PM2 production config — loads .env.production into the process (all Node versions).
 *
 * On server:
 *   cp .env.example .env.production && nano .env.production
 *   npm run build
 *   pm2 delete my-app-crm 2>/dev/null; pm2 start ecosystem.config.cjs && pm2 save
 */
const fs = require("fs");
const path = require("path");

const appDir = __dirname;

/** @param {string} filePath */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const productionEnv = loadEnvFile(path.join(appDir, ".env.production"));
const localEnv = loadEnvFile(path.join(appDir, ".env.local"));

if (!fs.existsSync(path.join(appDir, ".env.production"))) {
  console.warn(
    "[ecosystem] WARNING: .env.production not found in",
    appDir,
    "— LINE webhook will return 503 until you create it.",
  );
} else {
  const hasToken = Boolean(productionEnv.LINE_CHANNEL_ACCESS_TOKEN);
  const hasSecret = Boolean(productionEnv.LINE_CHANNEL_SECRET);
  console.log(
    "[ecosystem] .env.production loaded — LINE token:",
    hasToken,
    "secret:",
    hasSecret,
  );
}

const port = productionEnv.PORT || localEnv.PORT || process.env.PORT || "3000";
const nextBin = path.join(appDir, "node_modules/next/dist/bin/next");

if (!fs.existsSync(nextBin)) {
  console.error("[ecosystem] Run npm run build first. Missing:", nextBin);
}

module.exports = {
  apps: [
    {
      name: "my-app-crm",
      cwd: appDir,
      script: nextBin,
      interpreter: "node",
      args: `start -p ${port}`,
      env: {
        NODE_ENV: "production",
        PORT: port,
        ...productionEnv,
        ...localEnv,
      },
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 3000,
    },
  ],
};
