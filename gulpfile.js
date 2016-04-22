var gulp = require('gulp'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    uglify = require("gulp-uglify");

var paths = {
    sass: ['./app/scss/*.scss', './app/scss/_*.scss'],
    scripts: ['./app/js/*.js'],
    dist: {
        js: './public/assets/js/',
        css: './public/assets/css/'
    },
    appscss: './app/scss/app.scss'
};
var files = {
    jsbundle: 'app.bundle.min.js',
    cssbundle: 'app.bundle.min.css'
};

gulp.task('default', ['watch']);

gulp.task('sass', function(done) {
    gulp.src(paths.appscss)
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest(paths.dist.css))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest(paths.dist.css))
        .on('end', done);
});
gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.scripts, ['scripts']);
});
gulp.task('scripts', function() {
    gulp.src(paths.scripts)
        //.pipe(jshint())
        //.pipe(jshint.reporter('default'))
        .pipe(uglify())
        .pipe(concat(files.jsbundle))
        .pipe(gulp.dest(paths.dist.js));
});

var done = function() {

}
