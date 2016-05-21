'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var uuid = require('node-uuid');

describe('generator-vsts-task:task', function () {
  before(function () {
    this.answers = {
      name: 'testtask',
      friendlyName: 'test task',
      description: 'a test task',
      category: 'Deploy',
      visibility: ['Build', 'Release'],
      author: 'testuser'
    };
  });

  context('run on new directory', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/task'))
        .withPrompts(this.answers)
        .toPromise();
    });

    it('creates a task.json', function () {
      assert.file('src/testtask/task.json');
      assert.jsonFileContent('src/testtask/task.json', {
        name: 'testtask',
        friendlyName: 'test task',
        description: 'a test task',
        category: 'Deploy',
        visibility: ['Build', 'Release'],
        author: 'testuser',
        version: {Major: 0, Minor: 1, Patch: 0},
        demands: [],
        inputs: [{name: 'name', type: 'string', label: 'A name', defaultValue: 'World', required: 'true', helpMarkDown: 'If you\'re Arya Stark, you\'d enter `No one`.'}],
        instanceNameFormat: 'Hello $(name)'
      });

      var content = JSON.parse(fs.readFileSync('src/testtask/task.json'));
      assert(uuid.parse(content.id) !== null);
      assert(_.startsWith(content.helpMarkdown, '# TODO'));
    });

    it('adds contribution to extension manifest', function () {
      assert.jsonFileContent('src/vss-extension.json', {
        contributions: [
          {
            id: 'testtask',
            type: 'ms.vss-distributed-task.task',
            targets: [
              'ms.vss-distributed-task.tasks'
            ],
            properties: {
              name: 'testtask'
            }
          }
        ]
      });
    });

    it('adds task path to extension manifest', function () {
      assert.jsonFileContent('src/vss-extension.json', {
        files: [
          {
            path: 'testtask'
          }
        ]
      });
    });

    it('adds an icon file', function () {
      assert.file('src/testtask/icon.png');
      assert.file('src/testtask/icon.svg');
    });
  });

  context('with node template', function () {
    before(function () {
      this.answers.template = 'node';

      return helpers.run(path.join(__dirname, '../generators/task'))
        .withPrompts(this.answers)
        .toPromise();
    });

    it('creates template task', function () {
      assert.file('src/testtask/task.js');
    });

    it('creates template test for task', function () {
      assert.file('test/testtask/task.js');
      assert.fileContent('test/testtask/task.js', '../../src/testtask/task');
    });

    it('adds execution info to task.json', function () {
      assert.jsonFileContent('src/testtask/task.json', {
        execution: {
          Node: {
            target: 'task.js',
            argumentFormat: ''
          }
        }
      });
    });

    it('adds vsts-task-lib dependency to package.json', function () {
      assert.jsonFileContent('package.json', {
        dependencies: {
          'vsts-task-lib': '^0.8.2'
        }
      });
    });
  });

  context('with powershell template', function () {
    before(function () {
      this.answers.template = 'powershell';

      return helpers.run(path.join(__dirname, '../generators/task'))
        .withPrompts(this.answers)
        .toPromise();
    });

    it('creates template task', function () {
      assert.file('src/testtask/task.ps1');
    });

    it('creates template test for task', function () {
      assert.file('test/testtask/task.tests.ps1');
      assert.fileContent('test/testtask/task.tests.ps1', '. "$here\\..\\testtask\\task.ps1"');
    });

    it('adds execution info to task.json', function () {
      assert.jsonFileContent('src/testtask/task.json', {
        execution: {
          Powershell: {
            target: 'task.ps1',
            argumentFormat: ''
          }
        }
      });
    });
  });
});
