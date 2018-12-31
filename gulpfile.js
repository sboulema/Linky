var gulp = require('gulp');

gulp.task('scripts', function (done) {
  gulp.src('node_modules/bootstrap/dist/js/*.js').pipe(gulp.dest('dist/js'));
  gulp.src('node_modules/bootstrap/dist/css/*.css').pipe(gulp.dest('dist/css'));

  gulp.src('node_modules/bootstrap-treeview/dist/*.js').pipe(gulp.dest('dist/js'));
  gulp.src('node_modules/bootstrap-treeview/dist/*.css').pipe(gulp.dest('dist/css'));

  gulp.src('node_modules/bootstrap-list-filter/bootstrap-list-filter.min.js').pipe(gulp.dest('dist/js'));

  gulp.src('node_modules/mfb/src/*.js').pipe(gulp.dest('dist/js'));
  gulp.src('node_modules/mfb/src/*.css').pipe(gulp.dest('dist/css'));

  gulp.src('node_modules/sortablejs/*.js').pipe(gulp.dest('dist/js'));

  gulp.src('node_modules/clipboard/dist/*.js').pipe(gulp.dest('dist/js'));

  gulp.src('node_modules/file-saver/*.js').pipe(gulp.dest('dist/js'));

  gulp.src('node_modules/keymaster/*.js').pipe(gulp.dest('dist/js'));

  gulp.src('node_modules/jquery/dist/*.js').pipe(gulp.dest('dist/js'));

  gulp.src('node_modules/popper.js/*.js').pipe(gulp.dest('dist/js'));

  gulp.src('node_modules/fontawesome-iconpicker/dist/js/*.js').pipe(gulp.dest('dist/js'));
  gulp.src('node_modules/fontawesome-iconpicker/dist/css/*.css').pipe(gulp.dest('dist/css'));

  gulp.src('node_modules/bootstrap-fileinput/js/*.js').pipe(gulp.dest('dist/js'));
  gulp.src('node_modules/bootstrap-fileinput/css/*.css').pipe(gulp.dest('dist/css'));

  done();
});

gulp.task('copy', function (done) {
  gulp.src('css/*').pipe(gulp.dest('dist/css'));
  gulp.src('js/*').pipe(gulp.dest('dist/js'));
  gulp.src('favicon.ico').pipe(gulp.dest('dist'));
  gulp.src('index.html').pipe(gulp.dest('dist'));

  done();
});

gulp.task('build', gulp.parallel('scripts', 'copy'));