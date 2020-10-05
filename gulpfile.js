'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const server = require('browser-sync').create();
const rename = require('gulp-rename');
const del = require('del');

// css
const sourcemap = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sassGlob = require('gulp-sass-glob');
const csso = require('gulp-csso');

// image
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');

// html
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');

const css = () =>    {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream())
}

const browserSync = () =>  {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('css'));
  gulp.watch('source/img/icon-*.svg', gulp.series('sprite', 'html', 'refresh'));
  gulp.watch('source/js/**/*.js', gulp.series('js', 'refresh'));
  gulp.watch('source/*.html', gulp.series('html', 'refresh'));
}

const refresh = () => {
  server.reload();
  done();
}

const images = () => {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('source/img'));
}

const gulpWebp = () =>  {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 80}))
    .pipe(gulp.dest('source/img'));
}

const sprite = () => {
  return gulp.src('source/img/{icon-*}.svg')
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

const html = () => {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest('build'));
}

const copy = () => {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/img/**',
    'source/js/**',
    ], {
      base: 'source'
    })
  .pipe(gulp.dest('build'));
}

const js = () =>  {
  return gulp.src('source/js/**')
  .pipe(gulp.dest('build/js'));
}

const clean = () => {
  return del('build');
}

exports.css = css;
exports.browserSync = browserSync;
exports.refresh = refresh;
exports.images = images;
exports.webp = webp;
exports.sprite = sprite;
exports.html = html;
exports.copy = copy;
exports.js = js;
exports.clean = clean;

const build = gulp.series (
  clean,
  html,
  copy,
  css,
  sprite
);

exports.build = build;

exports.start = gulp.series (
  build, browserSync
);
