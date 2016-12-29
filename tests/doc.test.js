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
    let tagStr1 = md.renderTagTpl({
      content: `
      test.pug
      {
        "xx":"xx
      }
      `
    }, { title: 'xxx'});

    let jsonStr = md.renderJSON(`
    {
      "test": "{{m4.json}}"
    }
    `);
    console.log(jsonStr);


    // console.log(tagStr1);
    // console.log(modelStr);

  });

  it('测试渲染文档', () => {
    return co(function*(){
      let doc = targetFunc(
        `${__dirname}/models`,
        `${__dirname}/build`
      );
      yield doc.renderFileTree(`${__dirname}/tree`);

      yield doc.renderFileTree([
        `${__dirname}/tree`,
        `${__dirname}/tree.1`,
        `${__dirname}/tree.2`,
        `${__dirname}/mds/README.md`
      ]);
    });
  });

});
