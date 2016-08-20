'use strict';
// VARIABLES
var gulp = require('gulp'),
	sass = require('gulp-sass'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    nanoCss = require('gulp-cssnano'),
    notify = require('gulp-notify'),
    gutil = require('gulp-util'),
    browserSync = require('browser-sync'),
    prefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    ts = require('gulp-typescript');

function onError(err) {
    console.log(err);
}
// DEFAULT TASKS
gulp.task('default',
    [
        'sass:watch',
        'minify-overall',
        'js:watch',
        'js',
        'ts:watch',
        'ts',
        'html:watch',
        'browser-sync',
        'move-library',
        'minify-overall'
    ]);

// =============================
// =========== SASS ============
// =============================

gulp.task('sass-overall', function () {

    return gulp.src('src/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(prefixer('last 2 versions'))
        .pipe(gulp.dest('public/css/_extend'))
        .pipe(notify("Sass compiled (overall) !"))
        .pipe(plumber({errorHandler: onError}));
});

gulp.task('sass-specific', function () {
    return gulp.src('src/sass/pages/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(prefixer('last 2 versions'))
        .pipe(gulp.dest('public/css/_extend/pages'))
        .pipe(notify("Sass compiled (specific) !"))
        .pipe(plumber({errorHandler: onError}));
});


gulp.task('minify-overall',['sass-overall'],function(){
    return gulp.src('public/css/_extend/*.css')
        .pipe(nanoCss())
        .pipe(rename(function (path) {
            path.extname = ".min.css"
        }))
        .pipe(gulp.dest('public/css/'))
        .pipe(notify("CSS minified (overall) !"))
        .pipe(plumber({errorHandler: onError}));
});

gulp.task('minify-specific',['sass-specific'],function(){
    return gulp.src('public/css/_extend/pages/*.css')
        .pipe(nanoCss({discardComments: {removeAll: true}}))
         .pipe(rename(function (path) {
            path.extname = ".min.css"
         }))
        .pipe(gulp.dest('public/css/'))
        .pipe(notify("CSS minified (specific) !"))
        .pipe(plumber({errorHandler: onError}));
});

gulp.task('sass-unique', function () {
    gulp.src('src/sass/pages/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(prefixer('last 2 versions'))
        .pipe(notify("Sass compiled (overall) !"))
        .pipe(plumber({errorHandler: onError}));
});

gulp.task('sass:watch', function () {
  gulp.watch(['src/sass/**/*.scss', '!src/sass/pages/*.scss'], ['minify-overall',browserSync.reload]);
    gulp.watch(['src/sass/pages/*.scss'], ['minify-specific',browserSync.reload]);
});


// ===========================
// =========== JS ============
// ===========================
gulp.task('js:watch', function () {
    gulp.watch(
        'src/js/**/*.js', ['js',browserSync.reload],
        'src/js/*.js', ['js',browserSync.reload]
    );
});

gulp.task('js', function() {
    var src = 'src/js/*.js',
        dest = 'public/js';

    return gulp.src(src)
        .pipe(gulp.dest(dest+'/_extend'))
        .pipe(uglify({mangle:true}))
        .pipe(rename(function (path) {
            path.extname = ".min.js"
        }))
        .pipe(gulp.dest(dest))
        .pipe(notify("JS minified !"))
});

// TYPESCRIPT
gulp.task('ts:watch', function () {
    gulp.watch(
        'src/ts/**/*.ts', ['ts',browserSync.reload],
        'src/ts/*.ts', ['ts',browserSync.reload]
    );
});

gulp.task('ts', function () {
    var src = 'src/ts/*.ts',
        dest = 'public/js';
    return gulp.src(src)
        .pipe(ts({
            noImplicitAny: true
        }))
        .pipe(gulp.dest(dest+'/_extend'))
        .pipe(uglify({mangle:true}))
        .pipe(rename(function (path) {
            path.extname = ".ts.min.js"
        }))
        .pipe(gulp.dest(dest))
        .pipe(notify("TS minified !"));
});


// LIBRARY

gulp.task('move-library', function(){
  gulp.src('src/js/lib/*.js')
  .pipe(gulp.dest('js/lib'));
});


// ===========================
// ========== HTML ===========
// ===========================
gulp.task('html:watch', function () {
    gulp.watch(
        ['views/*.handlebars',
         'views/**/*.handlebars'
        ],[browserSync.reload]
    );
});



// ==============================
// ============ SYNC ============
// ==============================
gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: "http://localhost:5000/",
        ghostMode: {
            scroll: true
        }
    })
});