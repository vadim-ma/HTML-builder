const path = require('node:path');
const fs = require('node:fs/promises');

async function processFile(name, src, dstStream) {
  const srcFh = await fs.open(path.join(src, name), 'r');
  const srcStream = srcFh.createReadStream({ autoClose: true });
  srcStream.on('close', async () => {
    await srcFh.close();
  });
  return new Promise((resolve, reject) => {
    srcStream
      .pipe(dstStream, { end: false })
      .on('finish', resolve)
      .on('error', reject);
  });
}

async function build(src, dst) {
  const dstFh = await fs.open(dst, 'w');
  const dstStream = dstFh.createWriteStream({ autoClose: true });
  dstStream.on('close', async () => {
    await dstFh.close();
  });

  const dir = await fs.readdir(src, { withFileTypes: true });
  const promises = dir
    .filter((entry) => entry.isFile())
    .filter((entry) => path.extname(entry.name) === '.css')
    .map((entry) => processFile(entry.name, src, dstStream));

  Promise.all(promises).then(() => {
    console.log('all');
    dstStream.end();
  });
}

build(
  path.join(__dirname, 'styles'),
  path.join(__dirname, 'project-dist', 'bundle.css'),
);
