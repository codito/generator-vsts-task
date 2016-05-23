'use strict';

var path = require('path');
var process = require('process');
var _ = require('lodash');
var generators = require('yeoman-generator');
var uuid = require('node-uuid');
var username = require('username');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
  },

  initializing: function () {
    this.props = {};
  },

  prompting: function () {
    var done = this.async();

    var questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Name of task',
        default: path.basename(process.cwd()),
        filter: _.kebabCase,
        validate: function (str) {
          return str.length > 0;
        }
      },
      {
        type: 'input',
        name: 'friendlyName',
        message: 'Provide a friendly name (appears in Build/Release task list)',
        default: path.basename(process.cwd()),
        validate: function (str) {
          return str.length > 0;
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Describe your task',
        default: 'Sample task for vsts'
      },
      {
        type: 'list',
        name: 'category',
        message: 'Choose a category for this task',
        choices: ['Build', 'Utility', 'Test', 'Package', 'Deploy'],
        default: 'Utility'
      },
      {
        type: 'checkbox',
        name: 'visibility',
        message: 'Where should the task appear',
        choices: ['Build', 'Release'],
        default: 'Build'
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author\'s name',
        default: username.sync()
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose a runtime for the task',
        choices: ['Node', 'Powershell'],
        default: 'Node'
      }
    ];

    this.prompt(questions, function (answers) {
      this.props.name = answers.name;
      this.props.friendlyName = answers.friendlyName;
      this.props.description = answers.description;
      this.props.category = answers.category;
      this.props.visibility = answers.visibility;
      this.props.author = answers.author;

      this.props.template = _.toLower(answers.template);

      this.props.taskPath = path.join('src', this.props.name);
      this.props.taskTestPath = path.join('test', this.props.name);

      done();
    }.bind(this));
  },

  default: function () {
  },

  writing: {
    writeTaskJson: function () {
      var manifestPath = path.join(this.props.taskPath, 'task.json');
      var manifest = this.fs.readJSON(this.destinationPath(manifestPath), {});

      manifest.id = uuid.v4();
      manifest.name = this.props.name;
      manifest.friendlyName = this.props.friendlyName;
      manifest.description = this.props.description;
      manifest.helpMarkdown = '### TODO Write help content';
      manifest.category = this.props.category;
      manifest.visibility = this.props.visibility;
      manifest.author = this.props.author;
      manifest.version = {Major: 0, Minor: 1, Patch: 0};
      manifest.demands = [];

      // Merge the template tasks
      _.merge(manifest, {
        inputs: [
          {
            name: 'name',
            type: 'string',
            label: 'A name',
            defaultValue: 'World',
            required: 'true',
            helpMarkDown: 'A name. Enter `no one` if you\'re Arya Stark.'
          }
        ],
        instanceNameFormat: 'Hello $(name)'
      });

      this.fs.writeJSON(this.destinationPath(manifestPath), manifest);
    },

    updateExtensionManifest: function () {
      var manifest = this.fs.readJSON(this.destinationPath('src/vss-extension.json'), {});

      manifest.files = _.union(manifest.files, [{
        path: this.props.name
      }]);

      manifest.contributions = _.union(manifest.contributions, [{
        id: this.props.name,
        type: 'ms.vss-distributed-task.task',
        targets: [
          'ms.vss-distributed-task.tasks'
        ],
        properties: {
          name: this.props.name
        }
      }]);

      this.fs.writeJSON(this.destinationPath('src/vss-extension.json'), manifest);
    },

    copyIconFile: function () {
      this.fs.copy(this.templatePath('icon.png'), this.destinationPath(this.props.taskPath, 'icon.png'));
      this.fs.copy(this.templatePath('icon.svg'), this.destinationPath(this.props.taskPath, 'icon.svg'));
    },

    addNodeTemplates: function () {
      if (this.props.template !== 'node') {
        return;
      }

      // Add vsts-task-lib to package.json
      var pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
      pkg.dependencies = pkg.dependencies || {};
      pkg.dependencies['vsts-task-lib'] = '^0.8.2';
      this.fs.writeJSON(this.destinationPath('package.json'), pkg);

      // Add node handler to task.json
      var manifest = this.fs.readJSON(this.destinationPath(this.props.taskPath, 'task.json'), {});

      this.fs.copy(this.templatePath('node_task.js'), this.destinationPath(path.join(this.props.taskPath, 'task.js')));
      this.fs.copyTpl(this.templatePath('node_test.js'), this.destinationPath(path.join(this.props.taskTestPath, 'task.js')), {taskname: this.props.name});

      // Add the execution details
      _.merge(manifest, {
        execution: {
          Node: {
            target: 'task.js',
            argumentFormat: ''
          }
        }});

      this.fs.writeJSON(this.destinationPath(this.props.taskPath, 'task.json'), manifest);
    },

    addPowershellTemplates: function () {
      if (this.props.template !== 'powershell') {
        return;
      }

      var manifest = this.fs.readJSON(this.destinationPath(this.props.taskPath, 'task.json'), {});

      this.fs.copy(this.templatePath('powershell_task.ps1'), this.destinationPath(path.join(this.props.taskPath, 'task.ps1')));
      this.fs.copyTpl(
          this.templatePath('powershell_test.ps1'),
          this.destinationPath(path.join(this.props.taskTestPath, 'task.tests.ps1')),
          {name: this.props.name});

      // Add the execution details
      _.merge(manifest, {
        execution: {
          Powershell: {
            target: 'task.ps1',
            argumentFormat: ''
          }
        }});

      this.fs.writeJSON(this.destinationPath(this.props.taskPath, 'task.json'), manifest);
    }
  }
});
