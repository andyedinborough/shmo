var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var concat = require('gulp-concat');
var mincss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var livereload = require('gulp-livereload');

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
		.pipe(rename('shmo.min.css'))
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

// Debug Server
gulp.task('server', function(next) {
  var connect = require('connect'),
      server = connect();
  server.use(connect.static('./')).listen(process.env.PORT || 3000, next);
});

// Watch Files For Changes
gulp.task('watch', ['server'], function() {
	var server = livereload();
	gulp.watch('dist/**', function(file) {
		server.changed(file.path);
	});
	gulp.watch('js/*.js', ['lint', 'scripts']);
	gulp.watch('less/*.less', ['less']);
});

// Default Task
gulp.task('default', ['lint', 'less', 'scripts']);
gulp.task('debug', ['default', 'watch']);