import gulp from 'gulp';
import to5 from 'gulp-babel';
import oa from 'object.assign';

import paths from '../paths';
import * as compilerOptions from '../babel-options';
import { clean } from './clean';
const assign = Object.assign || oa;

function buildHtml() {
  return gulp.src(paths.html)
    .pipe(gulp.dest(paths.output + 'es2015'))
    .pipe(gulp.dest(paths.output + 'commonjs'))
    .pipe(gulp.dest(paths.output + 'amd'))
    .pipe(gulp.dest(paths.output + 'system'));
}

function buildEs2015() {
  return gulp.src(paths.source)
    .pipe(to5(assign({}, compilerOptions.es2015())))
    .pipe(gulp.dest(paths.output + 'es2015'));
}

function buildCommonjs() {
  return gulp.src(paths.source)
    .pipe(to5(assign({}, compilerOptions.commonjs())))
    .pipe(gulp.dest(paths.output + 'commonjs'));
}

function buildAmd() {
  return gulp.src(paths.source)
    .pipe(to5(assign({}, compilerOptions.amd())))
    .pipe(gulp.dest(paths.output + 'amd'));
}

function buildSystem() {
  return gulp.src(paths.source)
    .pipe(to5(assign({}, compilerOptions.system())))
    .pipe(gulp.dest(paths.output + 'system'));
}

const buildtasks = gulp.parallel(buildHtml, buildEs2015, buildCommonjs, buildAmd, buildSystem);
const build = gulp.series(clean, buildtasks);

export { build };
gulp.task('build', build);
