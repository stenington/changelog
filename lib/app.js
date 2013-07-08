var express = require('express');

var git = require('./git');
var paths = require('./paths');

exports.build = function(options) {
  var app = express();

  app.use(express.static(paths.staticDir));
  app.set('views', paths.viewDir);

  var repo = options.repo;
  git.cd(repo.dir);
  app.locals.repo = repo.owner + '/' + repo.owner.name;

  git.tags(function(error, tags){
    if (!error)
      app.locals.tags = tags;
  });

  app.get('/', function(req, res, next) {
    res.redirect(301, '/log');
  });

  app.get('/log', function(req, res, next) {
    var since = req.query.since;
    var until = req.query.until;

    git.log(since, until, function(err, result) {
      if (err) {
        console.log('Error:', err);
        return res.render('error.jade', result);
      }
      return res.render('log.jade', result);
    });
  });

  return app;
};