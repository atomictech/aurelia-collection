import gulp from 'gulp';
import eslint from 'gulp-eslint';
import eslintIfFixed from 'gulp-eslint-if-fixed';

import paths from '../paths';

// runs eslint on all .js files
function lintFix() {
  return gulp.src(paths.source)
    .pipe(eslint())
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslintIfFixed(paths.root));
}

function lint() {
  return gulp.src(paths.source)
    .pipe(eslint())
    .pipe(eslint.format());
  // .pipe(eslint.failAfterError());
}

export { lintFix, lint };

gulp.task('lint-fix', lintFix);
gulp.task('lint', lint);
