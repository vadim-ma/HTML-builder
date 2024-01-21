const path = require('node:path');
const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const streamPromises = require('node:stream/promises');

async function build(src, dst) {
  const outStream = fs.createWriteStream(dst);

  const dir = await fsPromises.readdir(src, { withFileTypes: true });
  const files = dir
    .filter((entry) => entry.isFile())
    .filter((entry) => path.extname(entry.name) === '.css');
  for (const file of files) {
    const inStream = fs.createReadStream(path.join(src, file.name), {
      encoding: 'utf8',
    });
    await streamPromises.pipeline(inStream, outStream, { end: false });
  }
}

build(
  path.join(__dirname, 'styles'),
  path.join(__dirname, 'project-dist', 'bundle.css'),
);
