import gulp from 'gulp';
import standardVersion from 'standard-version';

import { build } from './build';
import { lint } from './lint';

import args from '../args';

// generates the CHANGELOG.md file based on commit
// from git commit messages
function changelog(callback) {
  return standardVersion({
    releaseAs: args.bump
  }, function(err, log) {
    if (err) {
      console.error(`standard-version failed with message: ${err.message}`);
    }
    callback();
  });
}

const prepareRelease = gulp.series(
  build,
  lint,
  changelog);
export { prepareRelease };
gulp.task('changelog', changelog);

// calls the listed sequence of tasks in order
gulp.task('prepare-release', prepareRelease);

