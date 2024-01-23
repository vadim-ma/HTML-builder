const path = require('node:path');
const fs = require('node:fs/promises');

async function prepDst(dst) {
  await fs.rm(dst, { recursive: true, force: true });
  await fs.mkdir(dst, { recursive: true });
}

async function copyFile(name, src, dst) {
  await fs.copyFile(path.join(src, name), path.join(dst, name));
}

async function copyDir(src, dst) {
  const dir = await fs.readdir(src, { withFileTypes: true });
  for (const entry of dir) {
    if (!entry.isFile()) {
      continue;
    }
    await copyFile(entry.name, src, dst);
  }
}

const dst = path.join(__dirname, 'files-copy');
prepDst(dst);
copyDir(path.join(__dirname, 'files'), dst);
