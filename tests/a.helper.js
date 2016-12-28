'use strict';
const path = require('path');
const should = require('should');
const sinon = require('sinon');
const fse = require('fs-extra');

require('should-sinon');
const rootPath = path.normalize(__dirname + '/..');

//# 全局使用bluebird
global.Promise = require('bluebird');

global.TEST_GLOBAL = {
  rootPath: rootPath,
};
