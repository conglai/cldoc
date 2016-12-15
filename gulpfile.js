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

function buildMain(done) {
  pump([
    gulp.src('assets-src/main/*.less'),
    less(),
    concat('main.css'),
    gulp.dest('assets')
  ], done);
}

gulp.task('build-main-css', done => {
  buildMain(done);
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

gulp.task('dev', done => {
  gulp.watch('assets-src/main/**', e => {
    let filepath = e.path;
    if(filepath.indexOf('.less') !== -1) {
      buildMain(() => {
        gutil.log('main.css built.');
        buildStyle('gruvbox-dark.css').then(() => {
          gutil.log('cldoc-gruvbox-dark.css built.');
        });
      });
    } else if(filepath.indexOf('.js') !== -1) {
      pump([
        gulp.src(['assets-src/lib/*.js', 'assets-src/main/*.js']),
        concat('cldoc.js'),
        gulp.dest('assets')
      ], () => {
        gutil.log('cldoc.js built.');
      });
    }
  });
});

gulp.task('img', () => {
  let files = fs.readdirSync('assets-src/highlightjs');
  for (let i = files.length - 1; i >= 0 ; i--) {
    let filename = files[i];
    if(filename.indexOf('.css') === -1) {
      let bitmap = fs.readFileSync(`assets-src/highlightjs/${filename}`);
    // convert binary data to base64 encoded string
      let base64str = new Buffer(bitmap).toString('base64');
      console.log(filename + ':');
      console.log(base64str);
    }
  }
});
