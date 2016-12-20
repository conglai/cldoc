'use strict';
const { rootPath } = TEST_GLOBAL;
const co = require('co');
const fs = require('fs');
const targetFunc = require(`${rootPath}/lib/doc`);
const utils = require(`${rootPath}/lib/utils`);

function getMD(name) {
  return fs.readFileSync(`${__dirname}/mds/${name}`, 'utf8');
}

describe('测试lib/doc.js', () => {

  it('基础功能', () => {
    let md = targetFunc(
      `${__dirname}/models`,
      `${__dirname}/mds`,
      `${__dirname}/build`
    );

    let tagStr = md.renderTagTpl({
      content: `
      test.pug
      {
        "xx":"xx"
      }
      `
    }, { title: 'xxx'});
    // console.log(tagStr);
    // console.log(modelStr);

    let fileItem = md.defineFile({
      filepath: `${__dirname}/mds/example.md`,
      basename: 'example.md',
      tabSize: 2
    }, `${__dirname}/mds`);
    // console.log(fileItem);

  });

  it('->getNavTree', () => {
    let doc = targetFunc();
    let navTree = [
      { filepath: 'sss.ignore' },
      { filepath: 'ss.ignore' },
      { filepath: 'sss.igore' },
    ];
    let result = doc.getNavTree(navTree, /ignore/, true);
    result.length.should.be.equal(1);
    let result2 = doc.getNavTree(navTree, /ignore/, false);
    result2.length.should.be.equal(2);
  });

  it('测试渲染文档', () => {
    return co(function*(){
      let doc = targetFunc(
        `${__dirname}/models`,
        `${__dirname}/tree`,
        `${__dirname}/build`
      );
      yield doc.renderFileTree();
    });
  });

});
