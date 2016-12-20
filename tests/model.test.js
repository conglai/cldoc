'use strict';
const { rootPath } = TEST_GLOBAL;
const co = require('co');
const fs = require('fs');
const path = require('path');
const modelFunc = require(`${rootPath}/lib/model`);

const model = modelFunc([
  `${__dirname}/model-dirs/dir1`,
  `${__dirname}/model-dirs/dir2`,
  `${__dirname}/model-dirs/dir3`,
]);

describe('测试lib/model', () => {

  it('->getTpl', () => {
    let path = model.getTpl('test.json');
    let path1 = model.getTpl('test.1.json');
    path.indexOf('dir1').should.be.not.equal(-1);
    path1.indexOf('dir2').should.be.not.equal(-1);
  });


  it('->getModel not exits', () => {
    let modelStr = model.getModel('test.2.json');
    modelStr.should.be.equal('');
  });

  it('->getModel', () => {
    let modelStr = model.getModel('test.1.json');
    modelStr.should.be.equal('{ "x":"2" }');
  });



});
