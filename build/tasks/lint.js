import gulp from 'gulp';
import eslint from 'gulp-eslint';

import paths from '../paths';

// runs eslint on all .js files
function lint() {
  return gulp.src(paths.source)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
}
export { lint };

gulp.task(lint);
