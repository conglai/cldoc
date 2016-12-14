#!/usr/bin/env node

'use strict';
//# 全局使用bluebird
global.Promise = require('bluebird');
const program = require('commander');
const docFunc = require('./lib/doc');
const fse = require('fs-extra');
const rimraf = require('rimraf');
const co = require('co');
const workspace = process.cwd();

//清空build目录
function cleanDir(dirPath) {
  return new Promise((resolve, reject) => {
    rimraf(dirPath, (err) => {
      if(err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}


program
  .version('0.1.0')
  .arguments('<outputDir>')
  .description('文档工具')
  .action(outputDir => {
    console.log('run doc .....');
    co(function*(){
      yield cleanDir(outputDir);
      fse.ensureDirSync(outputDir);
      let doc = docFunc(`${workspace}/models`, `${workspace}/documents`, outputDir);
      yield doc.renderFileTree(item => {
        console.log(`generate ${item.filename}`);
      });
    });
  });

program.parse(process.argv);
