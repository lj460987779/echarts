"use strict";
let fs = require('fs'),
    gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    pngquant = require('imagemin-pngquant'),
    browser = require('browser-sync'),
    browserSync = browser.create(),
    reload = browserSync.reload,
    httpProxyMiddleware = require('http-proxy-middleware'),
    opts = JSON.parse(fs.readFileSync('config.json'));
    
var https = require('https');
const isPro = gulp.env.pro === undefined ? false : gulp.env.pro;
//console.log($);
//css任务
gulp.task('css', () => {
    return gulp.src(opts.dir.src.css)
        .pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        //.pipe($.sourcemaps.init())
        .pipe($.sass())
        .pipe($.concat(
            opts.plugins.concatcss
        ))
        .pipe($.autoprefixer(
            opts.plugins.autoprefixer
        ))
        .pipe($.cleanCss(
            opts.plugins.cleanCss
        ))
        //.pipe($.sourcemaps.write())
        .pipe(gulp.dest(opts.dir.dest.css))
        .pipe(reload({ stream: true }));
});
gulp.task('css-pro', () => {
    return gulp.src(opts.dir.src.css)
        .pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        .pipe($.sass())
        .pipe($.concat(
            opts.plugins.concatcss
        ))
        .pipe($.autoprefixer(
            opts.plugins.autoprefixer
        ))
        .pipe($.cleanCss(
            opts.plugins.cleanCss
        ))
        .pipe($.rev())
        .pipe(gulp.dest(opts.dir.dist.css))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(opts.rev.css));
});

//js任务
gulp.task('jslib', () => {
    return gulp.src(opts.dir.src.jslib).pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        .pipe($.cached('js'))
        .pipe($.sourcemaps.init())
        .pipe($.concat(
            opts.plugins.concat
        ))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(opts.dir.dest.js));
});
gulp.task('jslib-pro', () => {
    return gulp.src(opts.dir.src.jslib).pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        .pipe($.concat(
            opts.plugins.concat
        ))
        .pipe($.uglify(
            opts.plugins.uglify
        ))
        .pipe(gulp.dest(opts.dir.dest.js));
});
gulp.task('js', () => {
    return gulp.src(opts.dir.src.js).pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        .pipe($.sourcemaps.init())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(opts.dir.dest.js));
});
gulp.task('js-pro', () => {
    return gulp.src(opts.dir.src.js).pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        .pipe($.uglify(
            opts.plugins.uglify
        ))
        .pipe($.rev())
        .pipe(gulp.dest(opts.dir.dist.js))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(opts.rev.js));
});

//img任务
gulp.task('img', () => {
    return gulp.src(opts.dir.src.img).pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        .pipe($.cached('img'))
        .pipe($.imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: false, //类型：Boolean 默认：false 多次优化svg直到完全优化
            use: [
                pngquant({ quality: '65-80' })
            ]
        }))
        .pipe(gulp.dest(opts.dir.dest.img));
});
gulp.task('img-pro', () => {
    return gulp.src(opts.dir.src.img).pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        /*.pipe($.imagemin({
            optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: false, //类型：Boolean 默认：false 多次优化svg直到完全优化
            use: [
                pngquant({ quality: '65-80' })
            ]
        }))*/
        .pipe(gulp.dest(opts.dir.dist.img));
});

//html任务
gulp.task('html', () => {
    let src = opts.dir.src.html;
    return gulp.src(src).pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        .pipe($.cached('js'))
        .pipe($.fileInclude(
            opts.plugins.fileInclude
        ))
        .pipe(gulp.dest(opts.dir.dest.html));
});
gulp.task('html-pro', () => {
    let src = opts.dir.src.html;
    return gulp.src(src).pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        .pipe($.fileInclude(
            opts.plugins.fileInclude
        ))
        .pipe(gulp.dest(opts.dir.dist.html));
});
gulp.task('json-pro', () => {
    let src = opts.dir.src.json;
    return gulp.src(src).pipe($.plumber({ errorHandler: $.notify.onError('Error: <%= error.message %>') }))
        .pipe($.fileInclude(
            opts.plugins.fileInclude
        ))
        .pipe(gulp.dest(opts.dir.dist.json));
});
gulp.task('rev', function () {
    return gulp.src([opts.rev.revJson, opts.rev.src])
        .pipe( $.revCollector({
            replaceReved: true
        }) )
        .pipe( gulp.dest(opts.rev.dest) );
});
// clean 清空 dest 目录
gulp.task('clean', function() {
    return gulp.src(opts.dir.dist.dir)
            .pipe($.clean());
});
gulp.task('build',$.sequence("img-pro","css-pro","js-pro","html-pro","json-pro","rev"));
gulp.task('build-dev',$.sequence("css","jslib","js","img","html"));
//server
gulp.task('server', () => {
    var middleware = [
        httpProxyMiddleware(['/api/'], {
            target: 'http://www.uipmworld.cn/',
            changeOrigin: true,
            pathRewrite: {
                '^/api': ''
            }
        })
      //httpProxyMiddleware(['/comments/'], {target: 'https://api.sysshu.com/yongyuan', changeOrigin: true}),
  ];
    browserSync.init({
        server: {
            baseDir: opts.dir.dest.dir,
            middleware
        }
    });
    gulp.watch(opts.dir.watch.css, ['css']);
    gulp.watch(opts.dir.src.html, ['html']);
    gulp.watch(opts.dir.watch.html).on("change",reload);
    gulp.watch(opts.dir.watch.js).on("change",reload);
});
