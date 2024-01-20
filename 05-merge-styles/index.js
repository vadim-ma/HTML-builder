const path = require('node:path');
const fs = require('node:fs/promises');

async function processFile(name, src, dstStream) {
  const srcFh = await fs.open(path.join(src, name), 'r');
  const srcStream = srcFh.createReadStream({ autoClose: true });
  srcStream.on('close', async () => {
    await srcFh.close();
  });
  await srcStream.pipe(dstStream);
  dstStream.write('\n');
}

async function build(src, dst) {
  const dstFh = await fs.open(dst, 'w');
  const dstStream = dstFh.createWriteStream({ autoClose: true });
  dstStream.on('close', async () => {
    await dstFh.close();
  });

  const dir = await fs.readdir(src, { withFileTypes: true });
  for (const entry of dir) {
    if (!entry.isFile()) {
      continue;
    }
    if (path.extname(entry.name) !== '.css') {
      continue;
    }
    await processFile(entry.name, src, dstStream);
  }
}

build(
  path.join(__dirname, 'styles'),
  path.join(__dirname, 'project-dist', 'bundle.css'),
);
