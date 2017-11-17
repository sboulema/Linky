var gulp = require('gulp');

gulp.task('scripts', function () {
  gulp.src('node_modules/bootstrap-treeview/dist/*.js').pipe(gulp.dest('dist/js'));
  gulp.src('node_modules/bootstrap-treeview/dist/*.css').pipe(gulp.dest('dist/css'));

  gulp.src('node_modules/bootstrap-slider/dist/*.js').pipe(gulp.dest('dist/js'));
  gulp.src('node_modules/bootstrap-slider/dist/css/*.css').pipe(gulp.dest('dist/css'));

  gulp.src('node_modules/bootstrap-list-filter/bootstrap-list-filter.min.js').pipe(gulp.dest('dist/js'));

  gulp.src('node_modules/mfb/src/*.js').pipe(gulp.dest('dist/js'));
  gulp.src('node_modules/mfb/src/*.css').pipe(gulp.dest('dist/css'));

  gulp.src('node_modules/sortablejs/*.js').pipe(gulp.dest('dist/js'));
});

gulp.task('copy', function () {
  gulp.src('css/*').pipe(gulp.dest('dist/css'));
  gulp.src('js/*').pipe(gulp.dest('dist/js'));
  gulp.src('favicon.ico').pipe(gulp.dest('dist'));
  gulp.src('index.html').pipe(gulp.dest('dist'));
});

gulp.task('build', function () {
  gulp.start('scripts');
  gulp.start('copy');
});