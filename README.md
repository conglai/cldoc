# 一个简单的文档工具
Example repo: [https://github.com/ykan/ykan.github.com](https://github.com/ykan/ykan.github.com)

Result: [http://ykan.github.io/blog/](http://ykan.github.io/blog/)

## Install
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
[http://ykan.github.io/blog/lasted-1.doc-tool-tag.md.html](http://ykan.github.io/blog/lasted-1.doc-tool-tag.md.html)
