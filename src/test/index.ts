import * as testRunner from 'vscode/lib/testrunner';

testRunner.configure({
  ui: 'bdd',
  useColors: true,
});

module.exports = testRunner;
