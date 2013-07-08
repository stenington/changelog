#!/usr/bin/env node

const PORT = process.env['PORT'] || 3000;

var app = require('../').app.build({
  repo: {
    owner: 'mozilla',
    name: 'openbadges',
    dir: './openbadges'
  }
});

app.listen(PORT, function() {
  console.log("Listening on port " + PORT + ".");
});