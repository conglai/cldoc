'use strict';
const { rootPath } = TEST_GLOBAL;
const co = require('co');
const fs = require('fs');
const path = require('path');
const utils = require(`${rootPath}/lib/utils`);

function getMD(name) {
  return fs.readFileSync(`${__dirname}/mds/${name}`, 'utf8');
}

describe('测试lib/utils', () => {

  it('->filterComment', () => {
    let str = utils.filterComment(`
    //会有一部分默认数据
    {
      "title": "example", //ddd
    }
    `);
    // console.log(str);
    let str1 = utils.filterComment(`
    //会有一部分默认数据
    {
      "title": "\\\/\\/ddd",
    }
    `);
    // console.log(str1);
  });

  it('->getCodeBlocks', () => {
    let mdStr = getMD('codes.md');
    let blocks = utils.getCodeBlocks(mdStr);
    blocks.should.be.an.Array();
  });

  it('->getKeywords', () => {
    let keywords = utils.getKeywords(`

      asd\` xx-1 \`asd

      asd\` xxx \`asd
    `);
  });


  it('->getNavTree', () => {
    let navTree = [
      { filename: 'sss.ignore' },
      { filename: 'ss.ignore' },
      { filename: 'sss.igore' },
    ];
    let result = utils.getNavTree(navTree, /ignore/, true);
    result.length.should.be.equal(1);
    let result2 = utils.getNavTree(navTree, /ignore/, false);
    result2.length.should.be.equal(2);
  });

  it('->getTree', () => {
    return co(function*(){
      let navTree = yield utils.getTree(`${__dirname}/tree`, 1);
      let navTree1 = yield utils.getTree(`${__dirname}/tree`, 1, 'tree-');
    });
  });

  it('->defineFile', () => {
    return co(function*(){
      let item = yield utils.defineFile({
        filepath: `${__dirname}/mds/example.md`,
        basename: 'example.md',
        tabSize: 2
      }, __dirname + '/mds', 'ssss-');
      // console.log(item);
      item.should.have.keys('title', 'tabSize', 'blocks', 'url', 'filename',
        'basename', 'keywords', 'filepath', 'config');
      item.config.baseUrl.should.be.equal('xxxx');
      item.filename.should.be.equal('ssss-example.md.html');

      let item1 = yield utils.defineFile({
        filepath: `${__dirname}/mds/example.1.md`,
        basename: 'example.1.md',
        tabSize: 2
      }, __dirname + '/mds', 'ssss-');
      // console.log(item1);
    });
  });

});
