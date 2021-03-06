# 一个简单的文档工具
[![NPM version][npm-version-image]][npm-url] 
[![NPM downloads][npm-downloads-image]][npm-url] 
[![Build Status](https://travis-ci.org/conglai/cldoc.svg?branch=master)](https://travis-ci.org/conglai/cldoc)
[![Coverage Status](https://coveralls.io/repos/github/conglai/cldoc/badge.svg?t=1111)](https://coveralls.io/github/conglai/cldoc)
[![MIT License][license-image]][license-url]
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://npmjs.org/package/cldoc
[npm-version-image]: http://img.shields.io/npm/v/cldoc.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/cldoc.svg?style=flat


## 安装
NodeJS版本要求：`>=6.9.1`
```bash
~ npm install cldoc -g
```

## 使用
```
~ cldoc --help

  Usage: cldoc [options] <outputDir> [dirs...]

  文档工具

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```
* outputDir: 输出目录
* dirs: 当前目录下的文件夹，也可以是`README.md`

比如：
```
~ cldoc build dir1 dir2 README.md
```

## 一个简单的例子
网址：[http://ykan.github.io/blog/](http://ykan.github.io/blog/)
仓库：[https://github.com/ykan/ykan.github.com](https://github.com/ykan/ykan.github.com)

## 默认的目录
如果你只使用`cldoc build`，不指定目录，仓库必须包含以下两个目录：
```
- documents //存放文档
  - common // 类目目录，可以自己新建文件夹
    - README.md //目录的根页面，会被渲染为index.html，比如common/README.md，会生成common/index.html
    - example.md // -> common/example.md.html
    - example.ignore.md //注意：如果字符中包含了ignore，那么这个文件/文件夹将会再导航中被忽略
  - README.md // -> index.html 生成最外层的根页面
- models // 存放数据模型和模板
  - example.json
  - comment.pug //使用了pug模板
```

## 自定义的标签

### 嵌入配置
```
\`\`\`config
{
  "baseUrl": "//cdn.withme.cn/a/cldoc/0.2.7/",
  //foundation.css, gruvbox-light.css, school-book.css
  "styleName": "atelier-estuary-light.css"
}
\`\`\`
```
> 这段代码不会被渲染到文档中，但是它会成为一个数据到模板渲染的默认数据的`config`中

在最外层的`documents/README.md`中的`config`块中，会影响到布局模板的资源路径和样式名，比如上述配置会产生这样的结果：

```html
<link rel="stylesheet" href="//cdn.withme.cn/a/cldoc/0.2.7/cldoc-atelier-estuary-light.css">
```

代码样式，使用了`highlightjs`（[highlightjs可用样式](https://github.com/isagalaev/highlight.js/tree/master/src/styles)）：
```
atelier-estuary-light.css
foundation.css
gruvbox-light.css
school-book.css
...
```

### 可嵌入数据
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

渲染结果：
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


### 嵌入pug模板

```
\`\`\`tpl
example.pug
//第一行必须是文件名，后面是JSON数据
{
  "name": "xxx"
}
//会有一部分默认数据
{
  "title": "example", //ddd
  "basename": "example",
  "keywords": [],
  "filename": "example.md.html",
  "config": {}
}

\`\`\`
```

`models/example.pug`:
```pug
.ex= title
```

渲染结果：

```html
<div class="ex">example</div>
```

#### 默认包含一种`json-table.pug`的模板

```
\`\`\`tpl
json-table.pug
[
  //第一行是标题
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

渲染结果：

![table](http://cdn.withme.cn/withme.back.u.d34e1916fcbad43b31e0e00861acdfd8.png)


> 工具中包含的默认模板有3个
```
- default-models/
  - layout.pug //布局
  - nav.pug //导航
  - json-table.pug //json表格
```
