#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
const optimist = require('optimist');

const git = require ('../lib/git');

const PORT = process.env['PORT'] || 3000;

function readConfig(file) {
  var contents = fs.readFileSync(file); 
  return JSON.parse(contents);
}

var config = {};
config.repo = readConfig(__dirname + '/../config.json');

const argv = optimist
  .usage('Usage: changelog.js [setup]')
  .argv;

if (argv.h) {
  optimist.showHelp();
  process.exit(0);
}

if (argv._[0] === 'setup') {
  console.log('Installing...');
  var url = util.format('https://github.com/%s/%s.git', config.repo.owner, config.repo.name);
  var dir = __dirname + '/../' + config.repo.dir;
  console.log(util.format('Cloning %s into %s...'), url, dir);
  git.clone(url, dir, function(error) {
    var errCode = 0;
    if (error) {
      console.log("Clone failed:", error);
      errCode = 1;
    }
    else {
      console.log("Setup successful!");
    }
    process.exit(errCode);
  });
}
else {
  var app = require('../').app.build(config);

  app.listen(PORT, function() {
    console.log("Listening on port " + PORT + ".");
  });
}