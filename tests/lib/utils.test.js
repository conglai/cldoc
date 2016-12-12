'use strict';
const { rootPath } = TEST_GLOBAL;
const co = require('co');
const fs = require('fs');
const utils = require(`${rootPath}/lib/utils`);

function getMD(name) {
  return fs.readFileSync(`${__dirname}/mds/${name}`, 'utf8');
}

describe('测试lib/utils', () => {

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
