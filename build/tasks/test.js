var gulp = require('gulp');
var Karma = require('karma').Server;
var shell = require('gulp-shell');
var path = require('path');

gulp.task('coveralls', ['test'], function() { // 2nd arg is a dependency: 'karma' must be finished first.  
  // Send results of istanbul's test coverage to coveralls.io.
  return gulp.src('gulpfile.js', { read: false }) // You have to give it a file, but you don't have to read it.
    .pipe(shell('cat coverage/lcov.info | node_modules/coveralls/bin/coveralls.js'));
});

/**
 * Run test once and exit
 */
gulp.task('test', function(done) {
  new Karma({
    configFile: __dirname + '/../../karma.conf.js',
    singleRun: true
  }, done).start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function(done) {
  new Karma({
    configFile: __dirname + '/../../karma.conf.js'
  }, done).start();
});

gulp.task('coveralls', function(done) { // 2nd arg is a dependency: 'karma' must be finished first.
  process.env.NODE_ENV = 'test';

  new Karma({
    configFile: __dirname + '/../../karma.conf.js',
    singleRun: true,
    reporters: ['coverage'],
    preprocessors: {
      'test/**/*.js': ['babel'],
      'src/**/*.js': ['babel']
    },
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/coveralls',
      subdir: '.' // Output the results into ./coverage/
    }
  }, function() {
    let coverallsPath = path.join('node_modules', 'coveralls', 'bin', 'coveralls.js');
    let coverOutputPath = path.join('coverage', 'coveralls', 'lcov.info');
    gulp.src('gulpfile.js', { read: false }) // You have to give it a file, but you don't have to read it.
      .pipe(shell('cat ' + coverOutputPath + ' | ' + coverallsPath));
    done();
  }).start();
});

/**
 * Run test once with code coverage and exit
 */
gulp.task('cover', function(done) {
  process.env.NODE_ENV = 'test';

  new Karma({
    configFile: __dirname + '/../../karma.conf.js',
    singleRun: true,
    reporters: ['coverage'],
    preprocessors: {
      'test/**/*.js': ['babel'],
      'src/**/*.js': ['babel']
    },
    coverageReporter: {
      includeAllSources: true,
      reporters: [
        { type: 'html', dir: 'coverage' },
        { type: 'text' }
      ]
    }
  }, done).start();
});
