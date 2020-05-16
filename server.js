const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const util = require('util');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'text/plain' }));

// Uncomment this out once you've made your first route.
app.use(express.static(path.join(__dirname, 'client', 'build')));

// some helper functions you can use
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readDir = util.promisify(fs.readdir);

// some more helper functions
const DATA_DIR = 'data';
const TAG_RE = /#\w+/g;
function slugToPath(slug) {
  const filename = `${slug}.md`;
  return path.join(DATA_DIR, filename);
}
function jsonOK(res, data) {
  res.json({ status: 'ok', ...data });
}
function jsonError(res, message) {
  res.json({ status: 'error', message });
}

// If you want to see the wiki client, run npm install && npm build in the client folder,
// statically serve /client/build

// GET: '/api/page/:slug'
// success response: {status: 'ok', body: '<file contents>'}
// failure response: {status: 'error', message: 'Page does not exist.'}

app.get('/api/page/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const FILE_PATH = slugToPath(slug);
    const data = await readFile(FILE_PATH, 'utf-8');
    res.json({ status: 'ok', body: data });
  } catch (err) {
    jsonError(res, 'Page does not exist.');
  }
});

// POST: '/api/page/:slug'
// body: {body: '<file text content>'}
// success response: {status: 'ok'}
// failure response: {status: 'error', message: 'Could not write page.'}

app.post('/api/page/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const FILE_PATH = slugToPath(slug);
    const body = req.body.body;
    const data = await writeFile(FILE_PATH, body);
    jsonOK(res, data);
  } catch (err) {
    jsonError(res, 'Could not write page.');
  }
});

// GET: '/api/pages/all'
// success response: {status:'ok', pages: ['fileName', 'otherFileName']}
//  file names do not have .md, just the name!
// failure response: no failure response

app.get('/api/pages/all', async (req, res) => {
  const files = await readDir(DATA_DIR);
  data = [];
  files.forEach((el) => {
    data.push(el.substring(0, el.length - 3));
  });
  res.json({ status: 'ok', pages: data });
});

// GET: '/api/tags/all'
// success response: {status:'ok', tags: ['tagName', 'otherTagName']}
//  tags are any word in all documents with a # in front of it
// failure response: no failure response

app.get('/api/tags/all', async (req, res) => {
  const files = await readDir(DATA_DIR);
  let result = [];
  for (let file of files) {
    let info = await readFile(path.join(DATA_DIR, file), 'utf-8');
    let tag = info.match(TAG_RE);
    result.push(tag);
  }
  res.json({ status: 'ok', tags: result });
});

// app.get('/api/tags/all', async (req, res) => {
//   try {
//     const slug = req.params.slug;
//     const FILE_PATH = slugToPath(slug);
//     const data = await readFile(FILE_PATH, 'utf-8');
//     res.json({ status: 'ok', body: data });
//   } catch (err) {
//     jsonError(res, 'Page does not exist.');
//   }
// });

// const tagslar = [];
// data.forEach((file) => {
//   const tag = readFile(slugToPath(file), 'utf-8');
//   console.log(tag);
//var index = tag.indexOf('\n');
//tagslar.push(tag.substring(0, index));
//});
//jsonOK(res, tagslar);
//});

// GET: '/api/tags/:tag'
// success response: {status:'ok', tag: 'tagName', pages: ['tagName', 'otherTagName']}
//  file names do not have .md, just the name!
// failure response: no failure response

app.get('/api/tags/:tag', async (req, res) => {});

app.get('/api/page/all', async (req, res) => {
  const names = await fs.readdir(DATA_DIR);
  console.log(names);
  jsonOK(res, {});
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Wiki app is serving at http://localhost:${port}`));
