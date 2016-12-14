'use strict';

//# 全局使用bluebird
global.Promise = require('bluebird');
const gulp = require('gulp');
const gutil = require('gulp-util');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const less = require('gulp-less');
const concat = require('gulp-concat');
const pump = require('pump');
const co = require('co');
const fs = require('fs');

gulp.task('build-main-css', done => {
  pump([
    gulp.src('assets-src/main/*.less'),
    less(),
    concat('main.css'),
    gulp.dest('assets')
  ], done);
});

gulp.task('build-main-js', done => {
  pump([
    gulp.src('assets-src/main/*.js'),
    concat('main.js'),
    uglify(),
    gulp.dest('assets')
  ], done);
});

function buildStyle(styleName) {
  return new Promise((resolve, reject) => {
    pump([
      gulp.src(['assets/main.css', `assets-src/highlightjs/${styleName}`]),
      concat(`cldoc-${styleName}`),
      cssnano(),
      gulp.dest('assets')
    ], resolve);
  });
}

gulp.task('build-css', ['build-main-css'], () => {
  let codeStyles = fs.readdirSync('assets-src/highlightjs');
  return co(function*(){
    for (let i = 0, l = codeStyles.length; i < l ; i++) {
      let styleName = codeStyles[i];
      yield buildStyle(styleName);
      gutil.log(`build ${styleName}`, gutil.colors.green('ok'));
    }
  });
});

gulp.task('build-js', ['build-main-js'], done => {
  pump([
    gulp.src(['assets-src/lib/*.js', 'assets/main.js']),
    concat('cldoc.js'),
    gulp.dest('assets')
  ], done);
});

gulp.task('default', ['build-js', 'build-css']);
