var assert = require('assert');
var find = require('findit').find;
var findSync = require('findit').findSync;
var Hash = require('traverse/hash');

exports.foo = function () {
    var to = setTimeout(function () {
        assert.fail('Never caught "end"');
    }, 5000);
    
    var ps = {};
    var finder = find(__dirname + '/foo', function (file, stat) {
        ps[file] = stat.isDirectory();
    });
    
    var paths = []
    finder.on('path', function (p) {
        paths.push(p);
    });
    
    var dirs = []
    finder.on('directory', function (dir) {
        dirs.push(dir);
    });
    
    var files = []
    finder.on('file', function (file) {
        files.push(file);
    });
    
    finder.on('end', function () {
        clearTimeout(to);
        var ref = {
            'a' : true,
            'a/b' : true,
            'a/b/c' : true,
            'x' : false,
            'a/y' : false,
            'a/b/z' : false,
            'a/b/c/w' : false,
        };
        
        assert.eql(Object.keys(ref).length, Object.keys(ps).length);
        var count = { dirs : 0, files : 0, paths : 0 };
        
        Object.keys(ref).forEach(function (key) {
            var file = __dirname + '/foo/' + key;
            assert.eql(ref[key], ps[file]);
            if (ref[key]) {
                assert.ok(dirs.indexOf(file) >= 0);
                count.dirs ++;
            }
            else {
                assert.ok(files.indexOf(file) >= 0);
                count.files ++;
            }
        });
        
        assert.eql(count.dirs, dirs.length);
        assert.eql(count.files, files.length);
        assert.eql(paths.sort(), Object.keys(ps).sort());
    });
};
