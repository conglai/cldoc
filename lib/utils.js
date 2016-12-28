'use strict';
const fse = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const co = require('co');
//获取文件树
function getTree(treeDir, tabSize) {
  return co(function*(){
    let files = yield fse.readdirAsync(treeDir);
    let items = [];
    let dirName = path.basename(treeDir);
    for (let i = 0, l = files.length; i < l ; i++) {
      let filename = files[i];
      let absPath = `${treeDir}/${filename}`;
      let stats = yield fse.lstatAsync(absPath);
      if(stats.isDirectory()) {
        let subItems = yield getTree(absPath, tabSize + 1);
        items = items.concat(subItems);
      } else if(stats.isFile()) {
        let isMarkdown = path.extname(filename) === '.md';
        let item = {
          filepath: absPath,
          basename: filename,
          tabSize: tabSize
        };
        if(isMarkdown && filename === 'README.md') {
          item.tabSize --;
          items.unshift(item);
        } else if(isMarkdown) {
          items.push(item);
        }
      }
    }
    return items;
  });
}


//## 获取code的字符块
function getCodeBlocks(codeStr) {
  let blocks = codeStr.split('```');

  blocks = blocks.map((block, i) => {
    if(i % 2) {
      let codeBlock = blocks[i];
      let codeType = codeBlock.split('\n')[0];
      codeType = codeType.trim();
      let codeContent = codeBlock.replace(codeType, '');
      return {
        type: 'code',
        codeType: codeType,
        content: codeContent,
      };
    } else {
      return {
        type: 'text',
        content: blocks[i]
      };
    }
  });
  return blocks;
}

// 过滤注释
function filterComment(str) {
  return str.replace(/\/{2}.*/g, '');
}
// 获取md的标题
const titleReg = /^#([^#\n]*)/;
function getTitle(str) {
  // console.log(str);
  let res = str.match(titleReg);
  if(res && res.length) {
    return res[1].trim();
  } else {
    return '';
  }
}

const keywordsReg = /\`([^\`]*)\`/g;
function getKeywords(blockContent) {
  let res = keywordsReg.exec(blockContent);
  let keywords = [];
  blockContent.replace(keywordsReg, (matchStr, keyword) => {
    keywords.push(keyword.trim());
  });

  return keywords;
}


function mdCodeTag(block) {
  return `\`\`\`${block.codeType}\n${block.content}\n\`\`\``;
}


function errorTag(block, error) {
  block.codeType = 'js';
  let msgs = error.stack.split('\n');
  block.content += `\n${msgs[0]}\n${msgs[1]}`;
  return mdCodeTag(block);
}

// ## 获取导航树
function getNavTree(navTree, filterReg, isBlack, toSize) {
  toSize = toSize || 0;
  let tree = [];
  let baseSize = 1000;
  navTree.forEach(navItem => {
    let { filepath, tabSize, filename } = navItem;
    let isMatched = filterReg.test(filename);
    if((isBlack && !isMatched) || (!isBlack && isMatched)) {
      tree.push(navItem);
      if(tabSize < baseSize) {
        baseSize = tabSize;
      }
    }
  });
  // console.log(baseSize);
  tree.forEach(item => {
    item.tabSize -= baseSize;
    item.tabSize += toSize;
  });
  return tree;
}

module.exports = {
  getNavTree,
  mdCodeTag,
  errorTag,
  getTree,
  getCodeBlocks,
  filterComment,
  getTitle,
  getKeywords,
};
