/*jshint node: true */
(function(gulp, undefined) {
	'use strict';

	// Include Our Plugins
	var jshint = require('gulp-jshint');
	var less = require('gulp-less');
	var concat = require('gulp-concat');
	var mincss = require('gulp-minify-css');
	var uglify = require('gulp-uglify');
	var rename = require('gulp-rename');
	var livereload = require('gulp-livereload');
	var notify = require('gulp-notify');

	// Lint Task
	gulp.task('lint', function() {
		return gulp.src('js/*.js')
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
			.pipe(notify(function (file) {
				if (file.jshint.success) {
					// Don't show something if success
					return false;
				}

				var errors = file.jshint.results.map(function (data) {
				if (data.error) {
					return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
				}
				}).join("\n");
				return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
			}));
	});

	// Compile Our Sass
	gulp.task('less', function() {
		return gulp.src('less/shmo.less')
			.pipe(less())
			.pipe(gulp.dest('dist'))
			.pipe(rename('shmo.min.css'))
			.pipe(mincss())
			.pipe(gulp.dest('dist'));
	});

	// Concatenate & Minify JS
	gulp.task('scripts', function() {
		return gulp.src([
				'js/prototypes.js',
				'js/*.ext.js',
				'bower_components/jquery.tap/jquery.tap.js',
				'js/utils.js',
				'js/router.js',
				'js/transition.js',
				'js/notification.js',
				'js/pull.js',
				'js/shmo.js'
			])
			.pipe(concat('shmo.js'))
			.pipe(gulp.dest('dist'))
			.pipe(rename('shmo.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest('dist'));
	});

	gulp.task('copy', function(){
		gulp.src('bower_components/jquery/dist/jquery.min.js')
			.pipe(gulp.dest('dist'));
		gulp.src('bower_components/move.js/move.min.js')
			.pipe(gulp.dest('dist'));
		gulp.src('bower_components/bootstrap/fonts/**')
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
		gulp.watch('dist/**').on('change', function(file) {
			server.changed(file.path);
		});
		gulp.watch('js/*.js', ['lint', 'scripts']);
		gulp.watch('less/*.less', ['less']);
	});

	// Default Task
	gulp.task('default', ['lint', 'less', 'scripts', 'copy']);
	gulp.task('debug', ['default', 'watch']);

})(require('gulp'));
