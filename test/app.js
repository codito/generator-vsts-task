'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-vsts-task:app', function () {
  before(function () {
    this.answers = {
      name: 'test extension',
      publisher: 'test publisher',
      description: 'test description',
      tags: ['tag1', 'tag2'],
      uri: 'http://testuri'
    };
  });

  context('run on new directory', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .withPrompts(this.answers)
        .toPromise();
    });

    it('creates a node based gitignore', function () {
      assert.file('.gitignore');
      assert.fileContent('.gitignore', '# Created by https://www.gitignore.io/api/node');
    });

    it('creates a vss extension manifest', function () {
      assert.file('src/vss-extension.json');
      assert.jsonFileContent('src/vss-extension.json', {
        extensionId: 'test-extension',
        name: 'test extension',
        publisher: 'test publisher',
        description: 'test description',
        public: false,
        galleryFlags: ['Preview'],
        categories: ['Build and release'],
        tags: ['tag1', 'tag2'],
        links: {home: {uri: 'http://testuri'}, support: {uri: 'http://testuri'}},
        icons: {default: 'images/logo.png', large: 'images/logo_large.png'},
        content: {details: {path: 'README.md'}},
        branding: {color: '#777', theme: 'light'},
        files: [{path: 'images', addressable: true}],
        targets: [{id: 'Microsoft.VisualStudio.Services'}]
      });
    });

    it('creates a readme', function () {
      assert.file('src/README.md');
      assert.fileContent('src/README.md', 'test extension `0.1.0`');
      assert.fileContent('src/README.md', 'EDIT ME');
      assert.fileContent('src/README.md', '# Configuration');
      assert.fileContent('src/README.md', '> Show how to configure the extension');
      assert.fileContent('src/README.md', '# Usage');
    });

    it('creates a package.json', function () {
      assert.file('package.json');
      assert.jsonFileContent('package.json', {
        devDependencies: {
          'del': '^2.2.0',
          'gulp': '^3.9.0',
          'gulp-eslint': '^2.0.0',
          'gulp-istanbul': '^0.10.3',
          'gulp-mocha': '^2.0.0',
          'gulp-plumber': '^1.0.0',
          'gulp-util': '^3.0.7',
          'shelljs': '^0.7.0'
        }
      });
    });

    it('creates a gulpfile', function () {
      assert.file('gulpfile.js');
      assert.fileContent('gulpfile.js', 'gulp.task(\'lint');
      assert.fileContent('gulpfile.js', 'gulp.task(\'build');
      assert.fileContent('gulpfile.js', 'gulp.task(\'test');
      assert.fileContent('gulpfile.js', 'gulp.task(\'package');
    });

    it('creates logo files', function () {
      assert.file('src/images/logo.png');
      assert.file('src/images/logo_large.png');
    });
  });

  context('run on existing directory', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .withPrompts(this.answers)
        .toPromise();
    });

    it('creates files', function () {
      // merge src/vss-extension.json
      // merge src/tasks/taskName/task.json
      // create new src/tasks/taskName2/task.json
      // create new service endpoint contribution
      assert.file([
        '.gitignore'
      ]);
    });
  });

  context('node based extension', function () {
    // creates files: package.json
  });
});
