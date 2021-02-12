"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var server = require("browser-sync").create();
var rename = require("gulp-rename");
var del = require("del");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var deploy = require("gulp-gh-pages");

gulp.task("del", function () {
  return del("build");
});

gulp.task("copy", function () {
  return gulp.src([
    "source/assets/docs/**/*.pdf",
    "source/assets/fonts/**/*.{woff,woff2}",
    "source/assets/img/**",
    "source/**/*.html",
    "source/*.{svg,png}"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("html", function () {
  return gulp.src("source/**/*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("normalize", function () {
  return gulp.src("node_modules/normalize.css/normalize.css")
    .pipe(csso())
    .pipe(rename("normalize.min.css"))
    .pipe(gulp.dest("build/assets/css"));
});

gulp.task("sass", function () {
  return gulp.src("source/assets/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/assets/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/assets/sass/**/*.scss", gulp.series("sass"));
  gulp.watch("source/**/*.html", gulp.series("html", "reload"));
});

gulp.task("reload", function (done) {
  server.reload();
  done();
});

gulp.task("imagemin", function () {
  return gulp.src("build/assets/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo({
        plugins: [
          {convertStyleToAttrs: false},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest("build/assets/img"));
});

gulp.task("webp", function () {
  return gulp.src("build/assets/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/assets/img"));
});

gulp.task('deploy', function () {
  return gulp.src("./build/**/*")
    .pipe(deploy())
});

gulp.task("build", gulp.series("del", "copy", "normalize", "sass", "imagemin", "webp"));
gulp.task("start", gulp.series("build", "server"));