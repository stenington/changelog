var express = require('express');
var git = require('./lib/git').cd('./openbadges');

var port = process.env['PORT'] || 3000;

var app = express();
app.use(express.static(__dirname + '/static'));
app.set('views', __dirname + '/views');

app.locals.repo = 'mozilla/openbadges';
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

app.listen(port);