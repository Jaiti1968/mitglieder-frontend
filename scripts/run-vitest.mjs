import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const vitestPath = fileURLToPath(
  new URL("../node_modules/vitest/vitest.mjs", import.meta.url),
);

const result = spawnSync(
  process.execPath,
  [vitestPath, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      TZ: "Europe/Berlin",
    },
  },
);

process.exit(result.status ?? 1);
