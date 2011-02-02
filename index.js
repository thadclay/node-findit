var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var Seq = require('seq');

exports.find = function (base) {
    var em = new EventEmitter;
    
    (function find (dir, cb) {
        Seq()
            .seq(fs.readdir, dir, Seq)
            .flatten()
            .seqEach(function (file) {
                fs.stat(file, this.into(file));
            })
            .seq(function () {
                this(null, Object.keys(this.vars));
            })
            .flatten()
            .seqEach(function (file) {
                var stat = this.vars[file];
                if (stat.isDirectory()) {
                    em.emit('directory', file, stat);
                    find(file, this);
                }
                else {
                    em.emit('file', file, stat);
                }
            })
            .seq(cb.bind({}, null))
            .catch(em.emit.bind(em, 'error'))
        ;
    })(base, em.emit.bind(em, 'end'));
    
    return em;
};

exports.findSync = function findSync (dir) {
    return fs.readdirSync(dir)
        .reduce(function (files, file) {
            var p = dir + '/' + file;
            var stat = fs.statSync(p);
            
            if (stat.isDirectory()) {
                files.push.apply(files, findSync(p));
            }
            else {
                files.push(p);
            }

            return files;
        }, [])
    ;
};
