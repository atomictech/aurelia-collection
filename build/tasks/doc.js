import gulp from 'gulp';
import tools  from 'aurelia-tools';
import yuidoc from 'gulp-yuidoc';

import paths from '../paths';

function generateDoc() {
  return gulp.src(paths.source)
    .pipe(yuidoc.parser(null, 'api.json'))
    .pipe(gulp.dest(paths.doc));
}

function transformAPI() {
  return tools.transformAPIModel(paths.doc);
}

const doc = gulp.series(generateDoc, transformAPI);

export { doc };
gulp.task('doc-generate', generateDoc);
gulp.task('doc', doc);
