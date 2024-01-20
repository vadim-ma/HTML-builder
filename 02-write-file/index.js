const path = require('node:path');
const readline = require('node:readline');
const fs = require('node:fs/promises');

(async function () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const outFileName = path.join(__dirname, '02-write-file.txt');
  const outFh = await fs.open(outFileName, 'w');
  const outStream = outFh.createWriteStream({
    encoding: 'utf8',
    autoClose: true,
  });
  process.on('exit', () => {
    outFh.close();
    console.log('Bye!');
  });
  console.log("Enter text. Use 'exit' to finish"); // eslint-disable-line quotes
  rl.setPrompt('> ');
  rl.prompt();
  rl.on('line', (input) => {
    if (input === 'exit') {
      rl.close();
      process.exit();
    }
    outStream.write(input + '\n');
    rl.prompt();
  });
})();
