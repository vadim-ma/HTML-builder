const fsPromises = require('node:fs/promises');
const path = require('node:path');

const srcName = path.join(__dirname, 'text.txt');

(async () => {
  const srcFh = await fsPromises.open(srcName, 'r');
  const srcStream = srcFh.createReadStream({
    encoding: 'utf8',
    autoClose: true,
  });

  srcStream.pipe(process.stdout);
})();
