var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var connect = require('gulp-connect');

var paths = {
  sass: ['www/scss/**/*.scss']
};

gulp.task('connect', connect.server({
    root: ['www'],
    port: 1990,
    livereload: true
}));

gulp.task('sass', function(done) {
  gulp.src('www/scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('www/css/'))
    .on('end', done);
});

gulp.task('html', function () {
    gulp.src('./www/**/*.html')
        .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(['./www/**/*.html'], ['html']);
});

gulp.task('server', ['watch', 'connect']);
gulp.task('default', ['sass']);