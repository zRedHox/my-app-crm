/**
 * PM2 config for production.
 *
 * 1. On the server, create `.env.production` in this folder (see `.env.example`).
 * 2. pm2 delete my-app-crm 2>/dev/null; pm2 start ecosystem.config.cjs
 * 3. pm2 save
 *
 * Uses Node --env-file so LINE_* vars reach `next start` (PM2 does not load .env by itself).
 */
const path = require("path");

const appDir = __dirname;
const envFile = path.join(appDir, ".env.production");

module.exports = {
  apps: [
    {
      name: "my-app-crm",
      cwd: appDir,
      script: "node",
      args: [
        `--env-file=${envFile}`,
        "node_modules/next/dist/bin/next",
        "start",
        "-p",
        process.env.PORT || "3000",
      ],
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
