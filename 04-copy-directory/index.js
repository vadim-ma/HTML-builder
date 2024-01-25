const path = require("node:path");
const fs = require("node:fs/promises");

async function copyFile(name, src, dst) {
  await fs.copyFile(path.join(src, name), path.join(dst, name));
}

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });

  const dir = await fs.readdir(src, { withFileTypes: true });
  for (const entry of dir) {
    if (!entry.isFile()) {
      continue;
    }
    await copyFile(entry.name, src, dst);
  }
}

async function buildAssets(src, dst) {
  await fs.rm(dst, { recursive: true, force: true });
  await copyDir(src, dst);
}

const src = path.join(__dirname, "files");
const dst = path.join(__dirname, "files-copy");
buildAssets(src, dst);
