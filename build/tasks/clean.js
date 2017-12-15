import gulp from 'gulp';
import del from 'del';

import paths from '../paths';

const clean = () => del([paths.output]);
export { clean };
gulp.task('clean', clean);
