var async = require('async');
var util = require('util');
var child = require('child_process');

function exec(cmd, opts, callback) {
  console.log(util.format('Exec %s in %s', cmd, opts.cwd));
  child.exec(cmd, opts, callback);
}

module.exports = {

  log: function log(options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    var since = options.since;
    var until = options.until;
    var cwd = options.cwd || './';

    async.waterfall([
      function getUntil(callback) {
        if (until)
          return callback(null, until); 

        var cmd = 'git describe --abbrev=0 --tags';
        return exec(cmd, { cwd: cwd }, function(error, stdout, stderr){
          error = error || stderr;
          return callback(error, stdout.trim());
        });
      },
      function getSince(until, callback) {
        if (since)
          return callback(null, since, until);

        var cmd = util.format('git describe --abbrev=0 --tags %s~1', until);
        return exec(cmd, { cwd: cwd }, function(error, stdout, stderr) {
          error = error || stderr;
          return callback(error, stdout.trim(), until); 
        });
      },
      function (since, until, callback) {
        var cmd = util.format('git log %s..%s --pretty=format:"%h%x09%an%x09%ad%x09%s" --date=short --no-merges', since, until);
        exec(cmd, { cwd: cwd }, function(error, stdout, stderr){
          error = error || stderr;
          callback(error, since, until, stdout);
        });
      }
    ], function (err, since, until, stdout) {
      callback(err, {
        since: since,
        until: until,
        log: stdout
      });
    });
  },

  tags: function tags(options, callback){
    var cwd = options.cwd || './';
    var pattern = options.pattern || '';

    exec(
      util.format('git tag -l %s', pattern), 
      { cwd: cwd }, 
      function(error, stdout, stderr) {
        error = error || stderr;
        if (error) 
          return callback(error);

        var tags = stdout.trim().split('\n');
        tags.sort(function(a, b) {
          var aParts = a.match(/\d+/g);
          var bParts = b.match(/\d+/g);
          for (var i = 0; i < 3; i++) {
            var result = bParts[i] - aParts[i];
            if (result !== 0) 
              return result;
          }
          return 0;
        });
        callback(null, tags);
      }
    );
  }

};
