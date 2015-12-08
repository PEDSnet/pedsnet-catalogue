var env = require('./env'),
    resources = require('./resources');


var reverse = function() {
	if (arguments.length === 0) {
        return '/';
    }

	// invalid model name
    if (arguments.length >0 && resources.models.indexOf(arguments[0]) < 0) {
        return '/';
    }

    var addr = '/models/';

    for (var i=0; i<arguments.length; i++) {
        if (arguments[i]) {
            addr += (arguments[i] + '/');
        }
    }

    return addr;
};

var getCurrentPath = function() {
    var path = location.href;

    // trim off the base path
    if (env.root) {
        path = path.split(env.root)[1];
    }

    return path;
};


module.exports = {
    getCurrentPath: getCurrentPath,
    reverse: reverse
};
