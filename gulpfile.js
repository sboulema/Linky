var gulp = require('gulp');
var newfile = require('gulp-file');
var concat = require('gulp-concat');

gulp.task('scripts', function (done) {
  jsSources = [  
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    'node_modules/gijgo/js/gijgo.min.js',
    'node_modules/bootstrap-list-filter/bootstrap-list-filter.min.js',
    'node_modules/sortablejs/Sortable.min.js',
    'node_modules/clipboard/dist/clipboard.min.js',
    'node_modules/file-saver/FileSaver.min.js',
    'node_modules/keymaster/keymaster.js',  
    'node_modules/fontawesome-iconpicker/dist/js/fontawesome-iconpicker.min.js',
    'node_modules/@fortawesome/fontawesome-pro/js/all.min.js'
  ];

  cssSources = [
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'node_modules/gijgo/css/gijgo.min.css',
    'node_modules/fontawesome-iconpicker/dist/css/fontawesome-iconpicker.min.css'
  ];

  gulp.src(jsSources)
    .pipe(concat('bundle.js'))  
    .pipe(gulp.dest('dist/js'));

  gulp.src(cssSources)
    .pipe(concat('bundle.css'))  
    .pipe(gulp.dest('dist/css'));

  done();
});

gulp.task('copy', function (done) {
  gulp.src('css/*').pipe(gulp.dest('dist/css'));
  gulp.src('js/*').pipe(gulp.dest('dist/js'));
  gulp.src('favicon.ico').pipe(gulp.dest('dist'));
  gulp.src('index.html').pipe(gulp.dest('dist'));

  done();
});

gulp.task('webExtension', function (done) {
  jsSources = [  
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    'node_modules/gijgo/js/gijgo.min.js',
    'node_modules/@fortawesome/fontawesome-pro/js/all.min.js'
  ];

  cssSources = [
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'node_modules/gijgo/css/gijgo.min.css'
  ];

  gulp.src(jsSources).pipe(gulp.dest('webextension/dist/js'));
  gulp.src(cssSources).pipe(gulp.dest('webextension/dist/css'));

  gulp.src('webextension/img/*').pipe(gulp.dest('webextension/dist/img'));
  gulp.src('webextension/js/*').pipe(gulp.dest('webextension/dist/js'));
  gulp.src('webextension/css/popup.css').pipe(gulp.dest('webextension/dist/css'));
  gulp.src('webextension/manifest.json').pipe(gulp.dest('webextension/dist'));
  gulp.src('webextension/popup.html').pipe(gulp.dest('webextension/dist'));

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

  newfile('faIcons.js', 'var faIcons = ' + JSON.stringify(targetJSON.icons)).pipe(gulp.dest('dist/js'));

  done();
});

gulp.task('build', 
  gulp.parallel('scripts', 'copy', 'generateFA')
);