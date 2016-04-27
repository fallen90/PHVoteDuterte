var gulp = require('gulp'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    uglify = require("gulp-uglify"),
    server = require('gulp-express'),
    paths = {
        sass: ['./app/scss/*.scss', './app/scss/_*.scss'],
        scripts: ['./app/js/*.js'],
        dist: {
            js: './public/assets/js/',
            css: './public/assets/css/'
        },
        appscss: './app/scss/app.scss'
    },
    files = {
        jsbundle: 'app.bundle.min.js',
        cssbundle: 'app.bundle.min.css'
    };


gulp.task('default', ['serve']);

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
    try {
        gulp.src(paths.scripts)
            //.pipe(jshint())
            //.pipe(jshint.reporter('default'))
            .pipe(uglify())
            .pipe(concat(files.jsbundle))
            .pipe(gulp.dest(paths.dist.js));
    } catch(e){

    }
});

var done = function() {

}

gulp.task('serve', function() {
    // Start the server at the beginning of the task
    server.run(['app.js']);

    // Restart the server when file changes
    gulp.watch(['public/views/*.ejs'], server.notify);
    gulp.watch(['public/views/partials/*.ejs'], server.notify);

    gulp.watch(paths.sass, ['sass']); //style
    gulp.watch(paths.scripts, ['scripts']); //scripts

    gulp.watch(paths.scripts, function(e) {
        server.notify(e);
        gulp.run('scripts');
    });
    gulp.watch(['public/assets/css/*.css'], function(event) {
        server.notify(event);
    });

    gulp.watch(['app.js', 'facebook/index.js'], [server.run]);
});
