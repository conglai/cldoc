'use strict';
const co = require('co');
const fs = require('fs-extra');
const path = require('path');
const pug = require('pug');
const showdown  = require('showdown');
const _ = require('lodash');
const utils = require('./utils');


// MODEL_DIR: json数据目录
module.exports = function factoryDoc(
  MODEL_DIR, //数据模型目录
  DOC_DIR, //文档木目录
  BUILD_DIR //输出目录
) {
  const TPL_DIR = path.join(__dirname, '../default-models');

  //## 获取模板路径
  function getTpl(tplName) {
    if(fs.existsSync(`${MODEL_DIR}/${tplName}`)) {
      return `${MODEL_DIR}/${tplName}`;
    } else {
      return `${TPL_DIR}/${tplName}`;
    }
  }

  let modelMap = {};
  //## 获取模型数据
  function getModel(modelKey) {
    if(!modelMap[modelKey]) {
      let modelPath = getTpl(modelKey);
      let modelStr = fs.readFileSync(modelPath, 'utf8');
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

  // ## 渲染nav-list
  function renderNavList(navTree, catName) {
    let catNames = catName.split(':');
    catName = catNames[0];
    let toSize = 0;
    if(catNames[1]) {
      toSize = Number(catNames[1]) || 0;
    }
    let reg = new RegExp(catName);
    let tree = getNavTree(navTree, reg, false, toSize);
    let navTplPath = getTpl('nav.pug');
    let navHtml = pug.renderFile(navTplPath, {
      navTree: tree
    });
    return navHtml;
  }
  // ## 渲染模板
  function renderTagTpl(block, data) {
    let blockContent = block.content;
    blockContent = blockContent.trim();
    let lines = blockContent.split('\n');
    let tplName = lines.shift();
    let tplData;
    if(lines.length > 1) {
      let tplDataStr = lines.join('\n');
      tplDataStr = utils.filterComment(tplDataStr);
      try {
        tplData = JSON.parse(tplDataStr);
      } catch(e) {
        return _errorTag(block, e);
      }
      tplData = Object.assign(data, tplData);
    } else {
      tplData = data;
    }
    let htmlStr;
    try{
      let tplPath = getTpl(tplName);
      htmlStr = pug.renderFile(tplPath, tplData);
    } catch (e) {
      return _errorTag(block, e);
    }
    return htmlStr;
  }

  function _mdCodeTag(block) {
    return `\`\`\`${block.codeType}\n${block.content}\n\`\`\``;
  }
  //## 渲染代码块
  function renderCode(block, navTree, navItem) {
    let data = _.omit(navItem, 'blocks');
    switch (block.codeType) {
      case 'json':
        block.content = renderJSON(block.content);
        return _mdCodeTag(block);
      case 'nav-list':
        let catName = block.content.trim();
        return renderNavList(navTree, catName);
      case 'tpl':
        return renderTagTpl(block, data);
      default:
        return _mdCodeTag(block);
    }
  }

  // ## 对文件做预处理
  function defineFile(item, docDir) {
    let { filepath, tabSize, basename } = item;
    let codeStr = fs.readFileSync(filepath, 'utf8');
    let blocks = utils.getCodeBlocks(codeStr);
    let keywords = [], config;
    blocks.forEach(block => {
      if(block.type !== 'code') {
        let subs = utils.getKeywords(block.content);
        keywords = keywords.concat(subs);
      } else if(block.type === 'code' && block.codeType === 'config') {
        block.type = 'text';
        let configStr = block.content;
        configStr = utils.filterComment(configStr);
        try {
          config = JSON.parse(configStr);
          block.content = '';
        } catch(e) {
          block.content = _errorTag(block, e);
        }
      }
    });
    let title = utils.getTitle(blocks[0].content);
    title = title || basename;
    let url = filepath.replace(docDir + '/', '').replace(/\//g, '-');
    if(basename === 'README.md') {
      url = url.replace('README.md', 'index');
    }
    let filename = `${url.toLowerCase()}.html`;
    url = `./${filename}`;
    return { title, tabSize, blocks, url, filename, basename, keywords, filepath, config };
  }

  //## 对字符块做处理
  function renderBlocks(navItem, navTree) {
    let { blocks, url, title, keywords, basename } = navItem;
    let mdStr = '';
    for (let i = 0, l = blocks.length; i < l ; i++) {
      let block = blocks[i];
      if(block.type === 'code') {
        mdStr += renderCode(block, navTree, navItem);
      } else {
        mdStr += block.content;
      }
    }

    return mdStr;
  }

  function getNavTree(navTree, filterReg, isBlack, toSize) {
    toSize = toSize || 0;
    let tree = [];
    let baseSize = 1000;
    navTree.forEach(navItem => {
      let { filepath, tabSize } = navItem;
      let relativePath = filepath.replace(`${DOC_DIR}/`, '');
      let isMatched = filterReg.test(relativePath);
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

  //## 渲染文件树
  const defaultConfig = {
    baseUrl: './assets/',
    styleName: 'gruvbox-dark.css'
  };
  function renderFileTree(cb) {
    let converter = new showdown.Converter();
    return co(function*(){
      let navTree = yield utils.getTree(DOC_DIR, 1);
      navTree = navTree.map(navItem => defineFile(navItem, DOC_DIR));
      let tree = getNavTree(navTree, /ignore/, true);
      let navTplPath = getTpl('nav.pug');
      let navHtml = pug.renderFile(navTplPath, { navTree: tree });
      let rootItem = navTree[0];
      let rootConfig = rootItem.config || {};
      rootConfig = Object.assign(defaultConfig, {
        title: rootItem.title,
      }, rootConfig);

      navTree.forEach(navItem => {
        if(!navItem.blocks) {
          return;
        }
        let mdStr = renderBlocks(navItem, navTree);
        let docHtml = converter.makeHtml(mdStr);
        let layoutTplPath = getTpl('layout.pug');
        let htmlStr = pug.renderFile(layoutTplPath, {
          navHtml: navHtml,
          navItem: navItem,
          rootConfig: rootConfig,
          docHtml: docHtml
        });
        fs.writeFileSync(`${BUILD_DIR}/${navItem.filename}`, htmlStr, 'utf8');
        cb && cb(navItem);
      });
      if(rootConfig.baseUrl === './assets/') {
        fs.copySync(__dirname + '/../assets', BUILD_DIR + '/assets');
      }
      // console.log(navTree);
    });
  }
  return {
    getModel: getModel,
    renderJSON: renderJSON,
    getTpl: getTpl,
    renderTagTpl: renderTagTpl,
    defineFile: defineFile,
    renderFileTree: renderFileTree,
    getNavTree: getNavTree,
  };
};
