'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync');
const postcss = require('gulp-postcss');
const processInline = require('gulp-process-inline');
const customMedia = require('postcss-custom-media');
const inlineSource = require('gulp-inline-source');
const htmlmin = require('gulp-htmlmin');
const eslint = require('gulp-eslint');
const autoprefixer = require('autoprefixer');
const minify = require('gulp-htmlmin');
const argv = require('yargs').argv;
const rename = require('gulp-rename');

gulp.task('build', () => {
  const styles = processInline();
  const scripts = processInline();
  const debug = (argv.debug === undefined) ? false : true;

  return gulp.src(['src/*.html'])
    .pipe(inlineSource({
      compress: false,
      swallowErrors: true
    }))

    // JS
    .pipe(scripts.extract('script'))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(scripts.restore())

    // CSS
    .pipe(styles.extract('style'))
    .pipe(postcss([
      require('precss')({}),
      require('mdcss')({
        color: '#607D8B',
        polymerTheme: 'default-theme.html',
        examples: {
          css: ['css-docs/media-object.css'],
          bodycss: 'font-family: sans-serif; font-size: 14px;'
        }
      }),
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      }),
      customMedia()
    ]))
    .pipe(rename(function(path) {
      path.extname = '.css'
    }))
    .pipe(gulp.dest('./styleguide/css-docs/'))
    .pipe(styles.restore())

    // HTML
    .pipe(minify({
      removeComments: true,
      removeCommentsFromCDATA: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      caseSensitive: true,
      keepClosingSlash: true,
      customAttrAssign: [/\$=/],
      minifyCSS: !debug,
      minifyJS: !debug
    }))

    .pipe(gulp.dest('.'));
});

gulp.task('browserSync', () => {
  browserSync({
    server: {
      baseDir: './',
      index: 'index.html',
      routes: {
        '/': './bower_components'
      }
    },
    open: false,
    notify: false,
    ghostMode: false
  });
});

gulp.task('watch', () => {
  gulp.watch(['src/**/*', 'demo/**/*', 'test/**/*'], ['build', browserSync.reload]);
});

gulp.task('default', ['build', 'browserSync', 'watch']);

