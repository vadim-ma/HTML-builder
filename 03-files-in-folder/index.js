const path = require('node:path');
const fs = require('node:fs/promises');

const targetDir = path.join(__dirname, 'secret-folder');

async function processFile(file, base) {
  const fullName = path.join(base, file);
  const parse = path.parse(fullName);

  const stat = await fs.stat(fullName);
  if (!stat.isFile()) {
    return;
  }
  console.log(`${parse.name}-${parse.ext.replace('.', '')}-${stat.size}`);
}

async function main(dirName) {
  const dir = await fs.readdir(dirName);
  for (const entry of dir) {
    processFile(entry, dirName);
  }
}

main(targetDir);
