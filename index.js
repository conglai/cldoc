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
  .arguments('<outputDir> [dirs...]')
  .option('-c, --cancel-clean', '取消清理目录')
  .description('文档工具')
  .action((outputDir, dirs) => {
    console.log('run doc .....');
    co(function*(){
      if(!program.cancelClean) {
        yield cleanDir(outputDir);
      } else {
        console.log('Dir clean is canceled...');
      }
      fse.ensureDirSync(outputDir);

      let doc = docFunc(`${workspace}/models`,  outputDir);
      if(dirs && dirs.length) {
        dirs = dirs.map(dir => `${workspace}/${dir}`);
        yield doc.renderFileTree(dirs, (err, item) => {
          console.log(`generate ${item.filename}`);
        });
      } else {
        yield doc.renderFileTree(`${workspace}/documents`, (err, item) => {
          console.log(`generate ${item.filename}`);
        });
      }

    });
  });

program.parse(process.argv);
