'use strict';

var path = require('path');
var process = require('process');
var _ = require('lodash');
const username = require('username');
var generators = require('yeoman-generator');
var yosay = require('yosay');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
  },

  initializing: function () {
    this.log(yosay('Welcome to vsts task generator!'));

    this.props = {};
    this.props.version = '0.1.0';
  },

  prompting: {
    getExtensionType: function () {
      var questions = [
        {
          type: 'input',
          name: 'name',
          message: 'What would you call this extension?',
          default: path.basename(process.cwd()),
          validate: function (str) {
            return str.length > 0;
          }
        },
        {
          type: 'input',
          name: 'publisher',
          message: 'Your visualstudio publisher name',
          default: username.sync()
        },
        {
          type: 'input',
          name: 'description',
          message: 'How would you describe this extension?',
          default: 'My super awesome extension!'
        },
        {
          type: 'input',
          name: 'tags',
          message: 'Provide a few tags to describe this extension (comma separated)',
          filter: function (tags) {
            return tags.split(/\s*,\s*/g);
          }
        },
        {
          type: 'input',
          name: 'uri',
          message: 'Provide your website'
        },
        {
          type: 'confirm',
          name: 'addTask',
          message: 'Would you like to add a build/release task?',
          default: true
        }
      ];

      this.prompt(questions, function (answers) {
        this.props.extensionType = answers.extensionType;
        this.props.name = answers.name;
        this.props.extensionId = _.kebabCase(answers.name);
        this.props.description = answers.description;
        this.props.publisher = answers.publisher;
        this.props.tags = answers.tags;
        this.props.uri = answers.uri;
      }.bind(this));
    }
  },

  default: function () {
    this.composeWith('vsts-task:task', {}, {
      local: require.resolve('../task')
    });
  },

  writing: {
    addExtensionManifest: function () {
      var manifest = this.fs.readJSON(this.destinationPath('src/vss-extension.json'), {});

      manifest.manifestVersion = 1;
      manifest.extensionId = this.props.extensionId;
      manifest.name = this.props.name;
      manifest.version = this.props.version;
      manifest.publisher = this.props.publisher;
      manifest.description = this.props.description;
      manifest.public = false;
      manifest.galleryFlags = ['Preview'];
      manifest.icons = {
        default: 'images/logo.png',
        large: 'images/logo_large.png'
      };
      manifest.categories = ['Build and release'];
      manifest.tags = this.props.tags;
      manifest.links = {
        home: {uri: this.props.uri},
        support: {uri: this.props.uri}
      };
      manifest.branding = {
        color: '#777',
        theme: 'light'
      };
      manifest.content = {
        details: {path: 'README.md'}
      };
      manifest.files = [{path: 'images', addressable: true}];
      manifest.targets = [{id: 'Microsoft.VisualStudio.Services'}];

      this.fs.copyTpl(
          this.templatePath('gitignore'),
          this.destinationPath('.gitignore'));
      this.fs.copyTpl(
          this.templatePath('src/README.md'),
          this.destinationPath('src/README.md'), {
            name: this.props.name,
            version: this.props.version,
            description: this.props.description
          });

      this.fs.copy(
          this.templatePath('src/images/logo.png'),
          this.destinationPath('src/images/logo.png'));
      this.fs.copy(
          this.templatePath('src/images/logo_large.png'),
          this.destinationPath('src/images/logo_large.png'));

      this.fs.writeJSON(this.destinationPath('src/vss-extension.json'), manifest);
    },

    addPackageManifest: function () {
      var pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

      // Package.json is used only for dependency resolution
      // during packaging and gulp.
      _.merge(pkg, {
        name: _.kebabCase(this.props.name),
        version: '0.0.0',
        description: this.props.description,
        homepage: this.props.uri,
        author: {name: this.props.publisher},
        files: [],
        main: '',
        keywords: [],
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

      this.fs.writeJSON(this.destinationPath('package.json'), pkg);
    },

    addGulpfile: function () {
      this.fs.copy(
          this.templatePath('gulpfile.js'),
          this.destinationPath('gulpfile.js'));
    }
  },

  installing: function () {
    this.npmInstall();
  },

  end: function () {
    this.log('\nYour shiny new extension is ready! Try `gulp package` to check out :)');
    this.log('\nCustomize your extension as you like...');
    this.log('* Replace the logo.png, logo_large.svg files with your extension\'s logo.');
    this.log('* Replace the icon.png, icon.svg files with your task\'s logo. We recommend inkscape to create these files.');
    this.log('* Update ' + this.destinationPath('README.md'));
    this.log('Or publish the vsix if you\'re feeling adventurous.');
    this.log('\nIf you have feedback/bugs/praise for us, share it at');
    this.log('http://github.com/codito/generator-vsts-task/issues');
    this.log('We welcome patches/pull requests too ;)');
    this.log('\nAdieu!');
  }
});
