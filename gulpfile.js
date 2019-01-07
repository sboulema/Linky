var gulp = require('gulp');
var fs = require('fs');

gulp.task('scripts', function (done) {
  jsSources = [
    'node_modules/bootstrap/dist/js/*.js',
    'node_modules/gijgo/js/gijgo.min.js',
    'node_modules/bootstrap-list-filter/bootstrap-list-filter.min.js',
    'node_modules/sortablejs/*.js',
    'node_modules/clipboard/dist/*.js',
    'node_modules/file-saver/*.js',
    'node_modules/keymaster/*.js',
    'node_modules/jquery/dist/*.js',
    'node_modules/popper.js/*.js',
    'node_modules/fontawesome-iconpicker/dist/js/*.js',
    'node_modules/bootstrap-fileinput/js/*.js',
    'node_modules/@fortawesome/fontawesome-pro/js/all.min.js'
  ];

  cssSources = [
    'node_modules/bootstrap/dist/css/*.css',
    'node_modules/gijgo/css/gijgo.min.css',
    'node_modules/fontawesome-iconpicker/dist/css/*.css',
    'node_modules/bootstrap-fileinput/css/*.css'
  ];

  gulp.src(jsSources).pipe(gulp.dest('dist/js'));
  gulp.src(cssSources).pipe(gulp.dest('dist/css'));

  done();
});

gulp.task('copy', function (done) {
  gulp.src('css/*').pipe(gulp.dest('dist/css'));
  gulp.src('js/*').pipe(gulp.dest('dist/js'));
  gulp.src('favicon.ico').pipe(gulp.dest('dist'));
  gulp.src('index.html').pipe(gulp.dest('dist'));

  done();
});

gulp.task('generateFA', function(done) {
  let targetJSON = {
    icons: []
  };

  sourceJSON = require('./icons.json');

  Object.keys(sourceJSON).forEach(function(key) {
    let ele = sourceJSON[key];
    let icon = 'fa-' + key;
    ele.styles.forEach(function(style) {
      style = style.toLowerCase();
      if (style.startsWith('brand')) {
          targetJSON.icons.push({
              title: 'fab ' + icon,
              searchTerms: ele.search.terms
          });
      } else if (style.startsWith('solid')) {
          targetJSON.icons.push({
              title: 'fas ' + icon,
              searchTerms: ele.search.terms
          });
      } else if (style.startsWith('regular')) {
          targetJSON.icons.push({
              title: 'far ' + icon,
              searchTerms: ele.search.terms
          });
      } else if (style.startsWith('light')) {
          targetJSON.icons.push({
              title: 'fal ' + icon,
              searchTerms: ele.search.terms
          });
      }
    });
  });

  fs.closeSync(fs.openSync('dist/js/faIcons.js', 'var faIcons = ' + JSON.stringify(targetJSON.icons)));

  done();
});

gulp.task('build', 
  gulp.parallel('scripts', 'copy', 'generateFA')
);