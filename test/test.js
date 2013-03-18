var fs = require('fs');
var read = fs.readFileSync;
var files = fs.readdirSync;
var rm = fs.unlinkSync;
var join = require('path').join;
var assert = require('assert');
var print = require('util').print;
var exec = require('child_process').exec;

var fixturesDir = 'test/fixtures';
var fixtures = cleanFixtures();

function cleanFixtures() {
  files(fixturesDir).forEach(function(file) {
    if (!/(\.out|\.md)/.test(file))
      rm(join(fixturesDir, file));
  });
  return files(fixturesDir);
}

function pairs(array, fn) {
  var i = 0, len = array.length;
  for (; i < len; i += 2) fn(array[i], array[i + 1]);
}

function test(md, out) {
  var actual = read(join(fixturesDir, out.replace('.out', '')), 'utf8');
  var expected = read(join(fixturesDir, out), 'utf8');
  var hr = '-----------------------------------------\n';
  var msg = md + '\n' + hr + actual + hr + expected + hr

  assert.equal(actual, expected, msg);
  print('.');
}

exec('node writ.js "test/fixtures/*.md"', function() {
  pairs(fixtures, test);
  console.log();
  cleanFixtures();
});
