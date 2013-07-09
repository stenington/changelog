#!/usr/bin/env node

const fs = require('fs');
const util = require('util');

const PORT = process.env['PORT'] || 3000;

function readConfig(file) {
  var contents = fs.readFileSync(file); 
  return JSON.parse(contents);
}

var config = {};
config.repos = readConfig(__dirname + '/../config.json');

var app = require('../').app.build(config);

app.listen(PORT, function() {
  console.log("Listening on port " + PORT + ".");
});