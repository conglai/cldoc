# 一个简单的文档工具

## 安装
```bash
~ npm install cldoc -g
```

## 目录结构
仓库必须包含以下两个目录：
```
- documents //存放文档
    - common // 类目目录，可以自己新建文件夹
    - README.md //目录的根页面，会被渲染为index.html，比如common/README.md，会生成common/index.html
    - example.md // -> common/example.md.html
    - example.ignore.md //注意：如果字符中包含了ignore，那么这个文件将会再导航中被忽略
  - README.md // -> index.html 生成最外层的根页面
- models // 存放数据模型
  - example.json
```

## 使用
```base
~ cldoc <outputDir> #输出文件夹
```

## 自定义的标签

### 嵌入配置
```
&#x60;&#x60;&#x60;config
{
  "baseUrl": "//cdn.withme.cn/a/cldoc/0.2.7/",
  //foundation.css, gruvbox-light.css, school-book.css
  "styleName": "atelier-estuary-light.css"
}
&#x60;&#x60;&#x60;
```
> 这段代码不会被渲染到文档中，但是它会成为一个数据到模板渲染的默认数据的`config`中

在最外层的`documents/README.md`中的`config`块中，会影响到布局模板的资源路径和样式名，比如上述配置会产生这样的结果：

```html
<link rel="stylesheet" href="//cdn.withme.cn/a/cldoc/0.2.7/cldoc-atelier-estuary-light.css">
```

### 可嵌入数据
```
&#x60;&#x60;&#x60;json
{
  "example": "{{example.json}}"
}
&#x60;&#x60;&#x60;
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
&#x60;&#x60;&#x60;json
{
  "example": {
    // sss
    "x": "sss", //asdjf;jk;
    "items": "xxxx"
  }
}
&#x60;&#x60;&#x60;
```

### json来渲染表格

```
&#x60;&#x60;&#x60;json-table
[
  //第一行是标题
  { "name":"名称", "optional":"是否可选", "type": "类型", "desc":"描述" },
  { "name":"是打发打发", "optional":1, "type": "string", "desc":"啊啊士大夫撒打发士大夫撒旦法撒旦法撒旦法师的法师打发士大夫撒旦法法师打发士大夫撒旦法法师打发士大夫撒旦法" },
  { "name":"yushan", "optional":1, "type": "string", "desc":"xxx" },
  { "name":"yushan", "optional":1, "type": "string", "desc":"xxx" },
  { "name":"yushan", "optional":1, "type": "string", "desc":"xxx" }
]
&#x60;&#x60;&#x60;
```

渲染结果：

![table](http://cdn.withme.cn/withme.back.u.d34e1916fcbad43b31e0e00861acdfd8.png)

### 嵌入pug模板

```
&#x60;&#x60;&#x60;tpl
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

&#x60;&#x60;&#x60;
```

`models/example.pug`:
```pug
.ex= title
```

