'use strict';

var assert = require('assert');
var HelloTask = require('../../src/<%- taskname %>/task');

describe('helloTask', function () {
  context('with a name', function () {
    before(function () {
      this.task = new HelloTask('arya');
    });

    it('should greet the name', function () {
      assert(this.task.greet() === 'Hello arya!');
    });
  });
});
