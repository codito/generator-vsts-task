'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-vsts-task:node', function () {
  context('run on a new directory', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/node'))
        .withPrompts(this.answers)
        .on('end', done);
    });

  });
});
