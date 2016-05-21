'use strict';

var task = require('vsts-task-lib/task');

function HelloTask(name) {
  this.name = name;
}

HelloTask.prototype.greet = function () {
  return 'Hello ' + this.name + '!';
};

var helloTask = new HelloTask(task.getInput('name'));
console.log(helloTask.greet());

module.exports = HelloTask;
