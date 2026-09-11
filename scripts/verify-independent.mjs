import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const textExtensions = new Set([
  ".cjs",
  ".css",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
]);
const legacyRuntimeMarkers = [
  "@lovable",
  "cloud-auth-js",
  "lovable-tagger",
  "__l5e",
  "lovable.app",
  "professional-motion-story",
];
const serverOnlyMarkers = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "signPublishedStoragePaths",
  "storage.server",
];

function filesUnder(pathname) {
  const info = statSync(pathname);
  if (info.isFile()) return [pathname];
  return readdirSync(pathname, { withFileTypes: true }).flatMap((entry) => {
    const child = join(pathname, entry.name);
    if (entry.isDirectory()) return filesUnder(child);
    return textExtensions.has(join(".", entry.name.split(".").pop() ?? "")) ? [child] : [];
  });
}

function readText(pathname) {
  return readFileSync(pathname, "utf8");
}

const failures = [];
const runtimePaths = [
  "src",
  "public",
  "package.json",
  "vite.config.ts",
  "wrangler.jsonc",
  "supabase",
]
  .map((pathname) => resolve(root, pathname))
  .flatMap((pathname) => (existsSync(pathname) ? filesUnder(pathname) : []));

for (const pathname of runtimePaths) {
  const content = readText(pathname).toLowerCase();
  for (const marker of legacyRuntimeMarkers) {
    if (content.includes(marker.toLowerCase())) {
      failures.push(`${relative(root, pathname)} contains legacy Lovable marker: ${marker}`);
    }
  }
}

const trackedFiles = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter(Boolean);
for (const pathname of trackedFiles) {
  if (pathname === ".env.example") continue;
  if (/(^|\/)(\.env|\.dev\.vars)(\.|$)/.test(pathname)) {
    failures.push(`${pathname} is a tracked environment file`);
  }
}

const clientDirectory = resolve(root, "dist/client");
if (!existsSync(clientDirectory)) {
  failures.push("dist/client is missing; run npm run build before this check");
} else {
  for (const pathname of filesUnder(clientDirectory)) {
    const content = readText(pathname);
    for (const marker of serverOnlyMarkers) {
      if (content.includes(marker)) {
        failures.push(`${relative(root, pathname)} contains server-only marker: ${marker}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Independent-project verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    "Independent-project verification passed: no Lovable runtime markers, tracked env files, or server-only client bundle markers found.",
  );
}
