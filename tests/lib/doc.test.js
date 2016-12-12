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

    let modelStr = md.getModel('m1.json');
    // console.log(modelStr);
    let resultStr = md.renderJSON(modelStr);
    // console.log(resultStr);

    let str1 = md.renderJSONTable(`
    [
      {"name": "名称", "type": "类 \
      型"},
      {"name": "名称", "type": "类型"},
      {"name": "名称", "type": "类型"}
    ]
    `);

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
      // let navTree = yield doc.getTree(`${__dirname}/tree`, 1);
      // let md = targetFunc(`${__dirname}/models`, `${__dirname}/tree`, navTree);
      // md.renderNavList('1.cat');
    });
  });

});
