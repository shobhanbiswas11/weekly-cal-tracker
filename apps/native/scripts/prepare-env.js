const fs = require("fs");
const path = require("path");

const env = process.argv[2];
if (!env) {
  console.error(
    "Usage: node scripts/prepare-env.js <development|production|staging>",
  );
  process.exit(1);
}

const envFile = path.join(__dirname, "..", "env.json");
const config = JSON.parse(fs.readFileSync(envFile, "utf-8"));

if (!config[env]) {
  console.error(`Unknown environment: ${env}`);
  console.error(
    `Available: ${Object.keys(config)
      .filter((k) => k !== "base")
      .join(", ")}`,
  );
  process.exit(1);
}

const merged = { ...config.base, ...config[env] };

const lines = Object.entries(merged)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n");

const outPath = path.join(__dirname, "..", ".env.local");
fs.writeFileSync(outPath, lines + "\n");
console.log(`Prepared .env.local for [${env}]`);
