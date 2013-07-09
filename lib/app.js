var express = require('express');

var git = require('./git');
var paths = require('./paths');

exports.build = function(options) {
  var repos = options.repos;
  var app = express();

  app.use(express.static(paths.staticDir));
  app.set('views', paths.viewDir);

  app.param('project', function(req, res, next, id) {
    var project = repos[id];
    if (!project)
      return next('Unknown project');

    var tagPattern = project.tagPattern;
    var localPath = project.localPath;
    var githubUrl = project.githubUrl;
    var repo = githubUrl.match(/github\.com\/(.*)$\/?/)[1];

    git.tags({ 
      cwd: localPath,
      pattern: tagPattern
    }, function(error, tags){
      if (error)
        return next(error);

      req.localPath = localPath;
      res.locals({
        repo: repo,
        githubUrl: githubUrl,
        tags: tags
      });

      return next();
    });
  });

  app.get('/:project/log', function(req, res, next) {
    var since = req.query.since;
    var until = req.query.until;
    var localPath = req.localPath;

    git.log({
      since: since, 
      until: until, 
      cwd: localPath
    }, function(err, result) {
      if (err) {
        console.log('Error:', err);
        return res.render('error.jade', result);
      }
      return res.render('log.jade', result);
    });
  });

  return app;
};