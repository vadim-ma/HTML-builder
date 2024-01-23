const DIST = 'project-dist';
const TEMPLATE = 'template.html';
const COMPONENTS_DIR = 'components';
const HTML_BUNDLE = 'index.html';
const CSS_DIR = 'styles';
const CSS_BUNDLE = 'style.css';
const ASSETS_DIR = 'assets';

const path = require('node:path');
const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const streamPromises = require('node:stream/promises');

async function createDistDir() {
  const dir = path.join(__dirname, DIST);
  await fsPromises.mkdir(dir, { recursive: true });
}

async function replaceTemplates(template, components) {
  let ret = template;
  for (const component of components) {
    const componentContent = await fsPromises.readFile(
      path.join(__dirname, COMPONENTS_DIR, component.name),
      { encoding: 'utf8' },
    );
    const search = `{{${path.parse(component.name).name}}}`;
    ret = ret.replaceAll(search, componentContent);
  }
  return ret;
}

async function expandTemplate() {
  const componentsDir = await fsPromises.readdir(
    path.join(__dirname, COMPONENTS_DIR),
    {
      withFileTypes: true,
    },
  );

  const components = componentsDir
    .filter((entry) => entry.isFile())
    .filter((entry) => path.extname(entry.name) === '.html');

  const template = await fsPromises.readFile(path.join(__dirname, TEMPLATE), {
    encoding: 'utf8',
  });

  return await replaceTemplates(template, components);
}

async function writeHTML(content) {
  await fsPromises.writeFile(path.join(__dirname, DIST, HTML_BUNDLE), content, {
    encoding: 'utf8',
    flag: 'w',
  });
}

async function bundleHTML() {
  const expanded = await expandTemplate();
  await writeHTML(expanded);
}

async function bundleCSS() {
  const outStream = fs.createWriteStream(
    path.join(__dirname, DIST, CSS_BUNDLE),
  );

  const dir = await fsPromises.readdir(path.join(__dirname, CSS_DIR), {
    withFileTypes: true,
  });
  const files = dir
    .filter((entry) => entry.isFile())
    .filter((entry) => path.extname(entry.name) === '.css');
  for (const file of files) {
    const inStream = fs.createReadStream(
      path.join(__dirname, CSS_DIR, file.name),
      {
        encoding: 'utf8',
      },
    );
    await streamPromises.pipeline(inStream, outStream, { end: false });
  }
}

async function copyFiles(src, dst) {
  await fsPromises.mkdir(dst, { recursive: true });
  const dir = await fsPromises.readdir(src, {
    withFileTypes: true,
  });
  for (const entry of dir) {
    if (entry.isDirectory()) {
      await copyFiles(path.join(src, entry.name), path.join(dst, entry.name));
    } else if (entry.isFile()) {
      await fsPromises.copyFile(
        path.join(src, entry.name),
        path.join(dst, entry.name),
      );
    }
  }
}

async function bundleAssets() {
  const src = path.join(__dirname, ASSETS_DIR);
  const dst = path.join(__dirname, DIST, ASSETS_DIR);

  await fsPromises.rm(dst, { recursive: true, force: true });
  await copyFiles(src, dst);
}

createDistDir();
bundleHTML();
bundleCSS();
bundleAssets();
