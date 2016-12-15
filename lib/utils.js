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
    let hasIndex = false;
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
          hasIndex = true;
        } else if(isMarkdown) {
          items.push(item);
        }
      }
    }
    if(!hasIndex) {
      items.unshift({
        tabSize: tabSize - 1,
        basename: dirName,
        filepath: treeDir,
        noFile: true,
      });
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


module.exports = {
  getTree: getTree,
  getCodeBlocks: getCodeBlocks,
  filterComment: filterComment,
  getTitle: getTitle,
  getKeywords: getKeywords,
};
