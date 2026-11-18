// Sets the release version in every file that carries it, then commits and tags.
// Usage: npm run bump <version>      e.g. npm run bump 0.0.11
// Nothing is pushed: push the commit and tag yourself to start the Release workflow.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Usage: npm run bump <major.minor.patch>");
  process.exit(1);
}

const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

if (git("tag", "--list", `v${version}`)) {
  console.error(`Tag v${version} already exists.`);
  process.exit(1);
}

// Each entry: file, pattern matching the current version, replacement.
const edits = [
  ["package.json", /("version":\s*")[^"]+(")/, `$1${version}$2`],
  ["package-lock.json", /("version":\s*")[^"]+(")/g, `$1${version}$2`, 2],
  ["python/pyproject.toml", /^(version\s*=\s*")[^"]+(")/m, `$1${version}$2`],
  ["csharp/ScreenplayTools/ScreenplayTools.csproj", /(<Version>)[^<]+(<\/Version>)/, `$1${version}$2`],
];

const files = [];
for (const [file, pattern, replacement, limit] of edits) {
  const path = join(root, file);
  const text = readFileSync(path, "utf8");
  let count = 0;
  const updated = text.replace(pattern, (...m) => {
    count++;
    // In package-lock.json only the first two "version" fields are the root package's.
    if (limit && count > limit) return m[0];
    return replacement.replace("$1", m[1]).replace("$2", m[2]);
  });
  if (count === 0) {
    console.error(`No version found in ${file}.`);
    process.exit(1);
  }
  writeFileSync(path, updated);
  files.push(file);
}

git("commit", "-m", `Bump version to ${version}.`, "--", ...files);
git("tag", `v${version}`);

console.log(`Committed and tagged v${version}. To release:\n  git push origin main v${version}`);
