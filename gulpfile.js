var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var concat = require('gulp-concat');
var mincss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// Lint Task
gulp.task('lint', function() {
	return gulp.src('js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('less', function() {
	return gulp.src('less/shmo.less')
		.pipe(less())
		.pipe(gulp.dest('dist'))
		.pipe(rename('smo.min.css'))
		.pipe(gulp.dest('dist'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
	return gulp.src([
			'js/prototypes.js',
			'js/*.ext.js',
			'js/router.js',
			'js/transition.js',
			'js/shmo.js'
		])
		.pipe(concat('shmo.js'))
		.pipe(gulp.dest('dist'))
		.pipe(rename('shmo.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
	gulp.watch('js/*.js', ['lint', 'scripts']);
	gulp.watch('less/*.less', ['less']);
});

// Default Task
gulp.task('default', ['lint', 'less', 'scripts']);
