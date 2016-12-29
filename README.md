# A Simple Document Tool
[![NPM version][npm-version-image]][npm-url] 
[![NPM downloads][npm-downloads-image]][npm-url] 
[![Build Status](https://travis-ci.org/conglai/cldoc.svg?branch=master)](https://travis-ci.org/conglai/cldoc)
[![Coverage Status](https://coveralls.io/repos/github/conglai/cldoc/badge.svg)](https://coveralls.io/github/conglai/cldoc)
[![MIT License][license-image]][license-url]
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://npmjs.org/package/cldoc
[npm-version-image]: http://img.shields.io/npm/v/cldoc.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/cldoc.svg?style=flat


## Install
With ES6 destructuring used, it requires `NodeJS >= 6.9.1`.
```bash
~ npm install cldoc -g
```

## Usage
```
~ cldoc --help

  Usage: cldoc [options] <outputDir> [dirs...]

  文档工具

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```
* outputDir: target build directory.
* dirs: directories or `README.md`

You may use like this:
```
~ cldoc build dir1 dir2 README.md
```

## Example
Site: [https://www.ykan.space/docs/](https://www.ykan.space/docs/)

Repo: [https://github.com/ykan/ykan.github.com](https://github.com/ykan/ykan.github.com)

## Default Directory 
If you just run `cldoc build`, your directory should be like:
```
- documents //put markdown fils here
  - common // sub dir
    - README.md //sub index, generate common/index.html
    - example.md // -> common/example.md.html
    - example.ignore.md //if ignore，file will not in nav tree
  - README.md // -> index.html 
- models // you can replace default-models files here
  - example.json
  - comment.pug //only use pug
```

## NodeJS API

You may also use it in your own build process, like Gulp/Grunt:

```js
const cldoc = require('cldoc')(
  'models-dir', // provide a custom model dir, it can be not exits
  'output-dir', // dir that put output files 
);


cldoc.renderFileTree(['documents', 'another-dir',  'README.md'], (err, item) => {
  console.log(`generate ${item.filename}`);
});
// Or just one directory.
cldoc.renderFileTree('documents', (err, item) => {
  console.log(`generate ${item.filename}`);
});

```

## Custom Code Tag

### Config
```
\`\`\`config
{
  "baseUrl": "//cdn.withme.cn/a/cldoc/0.2.7/",
  //foundation.css, gruvbox-light.css, school-book.css
  "styleName": "atelier-estuary-light.css"
}
\`\`\`
```
> This block will not be rendered.

The `documents/README.md`'s `config` will be used in layout.pug, for example `baseUrl` will use like this：

```html
<link rel="stylesheet" href="//cdn.withme.cn/a/cldoc/0.2.7/cldoc-atelier-estuary-light.css">
```

Choose code style you like:（[highlightjs styles](https://github.com/isagalaev/highlight.js/tree/master/src/styles)）：
```
atelier-estuary-light.css
foundation.css
gruvbox-light.css
school-book.css
... // and so on
```

### Embed JSON
```
\`\`\`json
{
  "example": "{{example.json}}"
}
\`\`\`
```

`models/example.json`:
```
{
  // sss
  "x": "sss", //asdjf;jk;
  "items": "xxxx"
}
```

Result:
```
\`\`\`json
{
  "example": {
    // sss
    "x": "sss", //asdjf;jk;
    "items": "xxxx"
  }
}
\`\`\`
```


### Use Pug

```
\`\`\`tpl
example.pug
//First line should be just tpl file name.
{
  "name": "xxx"
}
//these are default data provide by code.
/*{
  "title": "example", //ddd
  "basename": "example",
  "keywords": [],
  "filename": "example.md.html",
  "config": {}
}*/

\`\`\`
```

`models/example.pug`:
```pug
.ex= title
```

Result:

```html
<div class="ex">example</div>
```

#### Default Pug Tpl(`json-table.pug`)

```
\`\`\`tpl
json-table.pug
[
  //First Line is title line
  { "name":"名称", "optional":"是否可选", "type": "类型", "desc":"描述" },
  { "name":"是打发打发", "optional":1, "type": "string", "desc":"啊啊士大夫撒打发士大夫撒旦法撒旦法撒旦法师的法师打发士大夫撒旦法法师打发士大夫撒旦法法师打发士大夫撒旦法" },
  { "name":"yushan", "optional":1, "type": "string", "desc":"xxx" },
  { "name":"yushan", "optional":1, "type": "string", "desc":"xxx" },
  { "name":"yushan", "optional":1, "type": "string", "desc":"xxx" }
]
\`\`\`
```
`default-models/json-table.pug`:
```pug
table
  thead
    tr
      each key in keys
        th= titleRow[key]
  tbody
    each row in rows
      tr
        each key in keys
          td= row[key]

```

Result:

![table](http://cdn.withme.cn/withme.back.u.d34e1916fcbad43b31e0e00861acdfd8.png)

