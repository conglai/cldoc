'use strict';
const co = require('co');
const fs = require('fs-extra');
const path = require('path');
const pug = require('pug');
const showdown  = require('showdown');
const _ = require('lodash');
const utils = require('./utils');
const modelFunc = require('./model');


// MODEL_DIR: json数据目录
module.exports = function factoryDoc(
  MODEL_DIR, //数据模型目录
  DOC_DIR, //文档木目录
  BUILD_DIR //输出目录
) {
  const model = modelFunc([
    MODEL_DIR,
    path.join(__dirname, '../default-models')
  ]);


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
        let modelStr = model.getModel(modelKey);
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

  // ## 渲染nav-list
  function renderNavList(navTree, catName) {
    let catNames = catName.split(':');
    catName = catNames[0];
    let toSize = 0;
    if(catNames[1]) {
      toSize = Number(catNames[1]) || 0;
    }
    let reg = new RegExp(catName);
    let tree = utils.getNavTree(navTree, reg, false, toSize);
    let navTplPath = model.getTpl('nav.pug');
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
        return utils.errorTag(block, e);
      }
      tplData = Object.assign(data, tplData);
    } else {
      tplData = data;
    }
    let htmlStr;
    try{
      let tplPath = model.getTpl(tplName);
      htmlStr = pug.renderFile(tplPath, tplData);
    } catch (e) {
      return utils.errorTag(block, e);
    }
    return htmlStr;
  }

  //## 渲染代码块
  function renderCode(block, navTree, navItem) {
    let data = _.omit(navItem, 'blocks');
    switch (block.codeType) {
      case 'json':
        block.content = renderJSON(block.content);
        return utils.mdCodeTag(block);
      case 'nav-list':
        let catName = block.content.trim();
        return renderNavList(navTree, catName);
      case 'tpl':
        return renderTagTpl(block, data);
      default:
        return utils.mdCodeTag(block);
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
          block.content = utils.errorTag(block, e);
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


  //## 渲染文件树
  const defaultConfig = {
    baseUrl: './assets/',
    styleName: 'atelier-estuary-light.css'
  };
  function renderFileTree(cb) {
    let converter = new showdown.Converter();
    return co(function*(){
      let navTree = yield utils.getTree(DOC_DIR, 1);
      navTree = navTree.map(navItem => defineFile(navItem, DOC_DIR));
      let tree = utils.getNavTree(navTree, /ignore/, true);
      let navTplPath = model.getTpl('nav.pug');
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
        let layoutTplPath = model.getTpl('layout.pug');
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
    renderJSON,
    renderTagTpl,
    defineFile,
    renderFileTree,
  };
};
