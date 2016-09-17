<p align="center">
    <a href="https://travis-ci.org/atomictech/aurelia-collection" align="center"><img src="https://travis-ci.org/atomictech/aurelia-collection.svg?branch=master"></a>&nbsp;&nbsp;
    <a href="https://coveralls.io/github/atomictech/aurelia-collection?branch=master"><img src="https://coveralls.io/repos/github/atomictech/aurelia-collection/badge.svg?branch=master"></a>&nbsp;&nbsp;
    <a href="https://www.npmjs.com/package/aurelia-collection"><img src="https://img.shields.io/npm/v/npm.svg"></a>&nbsp;&nbsp;
    <a href="https://raw.githubusercontent.com/atomictech/aurelia-collection/master/LICENSE" alt="License"><img src="https://img.shields.io/badge/license-MIT-blue.svg"></a>&nbsp;&nbsp;
</p>

# aurelia-collection

An opinionated collection of models abstraction for aurelia framework.
This is a work in progress, not ready to use yet.

## Building The Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

  ```shell
  npm install
  ```
3. Ensure that [Gulp](http://gulpjs.com/) is installed. If you need to install it, use the following command:

  ```shell
  npm install -g gulp
  ```
4. To build the code, you can now run:

  ```shell
  gulp build
  ```
5. You will find the compiled code in the `dist` folder, available in three module formats: AMD, CommonJS and ES6.

6. See `gulpfile.js` for other tasks related to generating the docs and linting.

## Running The Tests

To run the unit tests, first ensure that you have followed the steps above in order to install all dependencies and successfully build the library. Once you have done that, proceed with these additional steps:

1. Ensure that the [Karma](http://karma-runner.github.io/) CLI is installed. If you need to install it, use the following command:

  ```shell
  npm install -g karma-cli
  ```
2. Ensure that [jspm](http://jspm.io/) is installed. If you need to install it, use the following commnand:

  ```shell
  npm install -g jspm
  ```
3. Install the client-side dependencies with jspm:

  ```shell
  jspm install
  ```

4. You can now run the tests with this command:

  ```shell
  karma start
  ```
