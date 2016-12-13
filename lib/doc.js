'use strict';
const co = require('co');
const fs = require('fs-extra');
const pug = require('pug');
const showdown  = require('showdown');
const utils = require('./utils');


// MODEL_DIR: json数据目录
module.exports = function factoryDoc(
  MODEL_DIR, //数据模型目录
  DOC_DIR, //文档木目录
  BUILD_DIR //输出目录
) {
  const TPL_DIR = `${__dirname}/tpls`;

  let modelMap = {};
  //## 获取模型数据
  function getModel(modelKey) {
    if(!modelMap[modelKey]) {
      let modelStr = fs.readFileSync(`${MODEL_DIR}/${modelKey}`, 'utf8');
      modelStr = modelStr.replace(/\n+$/, '');
      modelMap[modelKey] = modelStr;
    }

    return modelMap[modelKey];
  }
  const modelReg = /\"{{([A-Za-z0-9\.\-\_]*)}}\"/;
  const spaceReg = /\s*/;
  // ##渲染json
  function renderJSON(codeContent, originModelKey) {
    let codeLines = codeContent.split('\n');

    codeLines = codeLines.map(codeLine => {
      let res = codeLine.match(modelReg);
      if(res && res.length) {
        let splitStr = res[0];
        let modelKey = res[1];
        let modelStr = getModel(modelKey);
        if(modelKey === originModelKey || !modelStr) {
          return codeLine;
        }
        let lineEls = codeLine.split(splitStr);
        let lineHeadSpaceChars = lineEls[0].match(spaceReg)[0];
        let renderedModelStr = renderJSON(modelStr, true, modelKey);

        let lines = renderedModelStr.split('\n');
        let resultModelStr = '';
        let lineLength = lines.length - 1;
        lines.forEach((line, lineIndex) => {
          if(lineIndex > 0) resultModelStr += lineHeadSpaceChars;
          resultModelStr += line;
          if(lineIndex < lineLength) resultModelStr += '\n';
        });
        let finalStr = '';
        let l = lineEls.length - 1;
        for (let i = 0; i < l ; i++) {
          let lineEl = lineEls[i];
          finalStr += lineEl;
          finalStr += resultModelStr;
        }
        finalStr += lineEls[l];
        return finalStr;
      } else {
        return codeLine;
      }
    });
    let result = codeLines.join('\n');
    return result;
  }

  function _errorTag(block, error) {
    block.codeType = 'js';
    let msgs = error.stack.split('\n');
    block.content += `\n${msgs[0]}\n${msgs[1]}`;
    return _mdCodeTag(block);
  }
  // ## 渲染json-table
  function renderJSONTable(block) {
    let codeStr = block.content;
    codeStr = utils.filterComment(codeStr);
    let data = false;
    try {
      data = JSON.parse(codeStr);
    } catch(e) {
      return _errorTag(block, e);
    }
    let titleRow = data.shift();
    let keys = Object.keys(titleRow);
    let htmlStr = pug.renderFile(`${TPL_DIR}/json-table.pug`, {
      keys: keys,
      titleRow: titleRow,
      rows: data
    });
    return htmlStr;
  }

  // ## 渲染nav-list
  function renderNavList(navTree, catName) {
    let reg = new RegExp(catName);
    let tree = getNavTree(navTree, reg, false);
    let navHtml = pug.renderFile(`${TPL_DIR}/nav.pug`, {
      navTree: tree
    });
    return navHtml;
  }
  // ## 渲染模板
  function renderTagTpl(block) {
    let blockContent = block.content;
    blockContent = blockContent.trim();
    let lines = blockContent.split('\n');
    let tplName = lines.shift();
    let tplDataStr = lines.join('\n');
    tplDataStr = utils.filterComment(tplDataStr);
    let tplData;
    try {
      tplData = JSON.parse(tplDataStr);
    } catch(e) {
      return _errorTag(block, e);
    }
    return pug.renderFile(`${MODEL_DIR}/${tplName}`, tplData);
  }

  function _mdCodeTag(block) {
    return `\`\`\`${block.codeType}\n${block.content}\n\`\`\``;
  }
  //## 渲染代码块
  function renderCode(block, navTree) {
    switch (block.codeType) {
      case 'json':
        block.content = renderJSON(block.content);
        return _mdCodeTag(block);
      case 'nav-list':
        let catName = block.content.trim();
        return renderNavList(navTree, catName);
      case 'tpl':
        return renderTagTpl(block);
      case 'json-table':
        return renderJSONTable(block);
      default:
        return _mdCodeTag(block);
    }
  }

  // ## 对文件做预处理
  function defineFile(item, docDir) {
    let { filepath, tabSize, basename, noFile } = item;
    if(noFile) {
      return {
        title: basename,
        tabSize: tabSize,
        url: 'javascript:;',
        basename: basename,
        filepath: filepath,
        keywords: []
      };
    }
    let codeStr = fs.readFileSync(filepath, 'utf8');
    let blocks = utils.getCodeBlocks(codeStr);
    let keywords = [];
    blocks.forEach(block => {
      if(block.type !== 'code') {
        let subs = utils.getKeywords(block.content);
        keywords = keywords.concat(subs);
      }
    });
    let title = utils.getTitle(blocks[0].content);
    title = title || basename;
    let url = filepath.replace(docDir + '/', '').replace(/\//g, '-');
    if(basename === 'README.md') {
      url = url.replace('README.md', 'index');
    }
    let filename = `${url.toLowerCase()}.html`;
    url = `./${filename}?t=${Date.now()}`;
    return { title, tabSize, blocks, url, filename, basename, keywords, filepath };
  }

  //## 对字符块做处理
  function renderBlocks(blocks, navTree) {
    let mdStr = '';
    for (let i = 0, l = blocks.length; i < l ; i++) {
      let block = blocks[i];
      if(block.type === 'code') {
        mdStr += renderCode(block, navTree);
      } else {
        mdStr += block.content;
      }
    }

    return mdStr;
  }

  function getNavTree(navTree, filterReg, isBlack) {
    let tree = [];
    let baseSize = 1000;
    navTree.forEach(navItem => {
      let { filepath, tabSize } = navItem;
      let relativePath = filepath.replace(`${DOC_DIR}/`, '');
      let isMatched = filterReg.test(relativePath);
      if((isBlack && !isMatched) || (!isBlack && isMatched)) {
        tree.push(Object.assign(navItem));
        if(tabSize < baseSize) {
          baseSize = tabSize;
        }
      }
    });
    // console.log(baseSize);
    tree.forEach(item => {
      item.tabSize -= baseSize;
    });
    return tree;
  }

  //## 渲染文件树
  function renderFileTree() {
    let converter = new showdown.Converter();
    return co(function*(){
      let navTree = yield utils.getTree(DOC_DIR, 1);
      navTree = navTree.map(navItem => defineFile(navItem, DOC_DIR));
      let tree = getNavTree(navTree, /ignore/, true);
      let navHtml = pug.renderFile(`${TPL_DIR}/nav.pug`, { navTree: tree });
      let footerText = navTree[0].title;
      navTree.forEach(navItem => {
        if(!navItem.blocks) {
          return;
        }
        let mdStr = renderBlocks(navItem.blocks, navTree);
        let docHtml = converter.makeHtml(mdStr);
        let htmlStr = pug.renderFile(`${TPL_DIR}/layout.pug`, {
          navHtml: navHtml,
          title: navItem.title,
          docHtml: docHtml,
          footerText: footerText
        });
        fs.writeFileSync(`${BUILD_DIR}/${navItem.filename}`, htmlStr, 'utf8');
        console.log(`generate doc:${BUILD_DIR}/${navItem.filename}`);
      });
      fs.copySync(__dirname + '/assets', BUILD_DIR + '/assets');
      // console.log(navTree);
    });
  }
  return {
    getModel: getModel,
    renderJSON: renderJSON,
    renderJSONTable: renderJSONTable,
    renderTagTpl: renderTagTpl,
    defineFile: defineFile,
    renderFileTree: renderFileTree,
    getNavTree: getNavTree,
  };
};
