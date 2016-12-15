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

  it('->getTree', () => {
    return co(function*(){
      let navTree = yield utils.getTree(`${__dirname}/tree`, 1);
      // console.log(navTree);
    });
  });

});
