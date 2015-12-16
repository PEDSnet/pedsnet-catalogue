var resources = require('./resources');

var root = require('./env').root;


var reverse = function(name) {
    var path = '/';

    switch(name) {
        case 'model':
            path = '/models/';
            
            for (var i=1; i<arguments.length; i++) {
                if (arguments[i]) {
                    path += (arguments[i] + '/');
                }
            }
    }

    return root + path;
};

var getCurrentPath = function() {
    var path = location.href;

    // trim off the base path
    if (root) {
        path = path.substring(path.indexOf(root), path.length-1);
    }

    return path;
};


module.exports = {
    getCurrentPath: getCurrentPath,
    reverse: reverse
};
