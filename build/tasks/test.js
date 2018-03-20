import gulp from 'gulp';
import { Server as Karma } from 'karma';
import shell from 'gulp-shell';
import path from 'path';

/**
 * Run test once and exit
 */
function test(done) {
  process.env.NODE_ENV = 'test';

  new Karma({
    configFile: __dirname + '/../../karma.conf.js',
    singleRun: true
  }, done).start();
}
gulp.task(test);

/**
 * Run test once on Chrome and exit
 */
function testChrome(done) {
  new Karma({
    configFile: __dirname + '/../../karma.conf.js',
    singleRun: true,
    jspm: {
      loadFiles: ['test/setup.js', 'test/unit/**/*.js']
    },
    browsers: ['Chrome']
  }, done).start();
}
gulp.task('test-chrome', testChrome);

/**
 * Watch for file changes and re-run tests on each change
 */
function tdd(done) {
  new Karma({
    configFile: __dirname + '/../../karma.conf.js'
  }, done).start();
}
gulp.task(tdd);

/**
 * Run test once on Chrome and exit
 */
function tddChrome(done) {
  new Karma({
    configFile: __dirname + '/../../karma.conf.js',
    jspm: {
      loadFiles: ['test/setup.js', 'test/unit/**/*.js']
    },
    browsers: ['Chrome']
  }, done).start();
}
gulp.task('tdd-chrome', tddChrome);

function coveralls(done) {
  process.env.NODE_ENV = 'test';

  new Karma({
    configFile: __dirname + '/../../karma.conf.js',
    singleRun: true,
    reporters: ['coverage'],
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/coveralls',
      subdir: '.' // Output the results into ./coverage/
    }
  }, function() {
    let coverallsPath = path.join('node_modules', 'coveralls', 'bin', 'coveralls.js');
    let coverOutputPath = path.join('coverage', 'coveralls', 'lcov.info');
    gulp.src('gulpfile.babel.js', { read: false }) // You have to give it a file, but you don't have to read it.
      .pipe(shell('cat ' + coverOutputPath + ' | ' + coverallsPath));
    done();
  }).start();
}
gulp.task(coveralls);

/**
 * Run test once with code coverage and exit
 */
function cover(done) {
  process.env.NODE_ENV = 'test';

  new Karma({
    configFile: __dirname + '/../../karma.conf.js',
    singleRun: true,
    reporters: ['coverage'],
    coverageReporter: {
      includeAllSources: true,
      reporters: [
        { type: 'html', dir: 'coverage' },
        { type: 'text' }
      ]
    }
  }, done).start();
}
gulp.task('cover', cover);
