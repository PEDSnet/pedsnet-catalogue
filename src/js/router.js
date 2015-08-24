var resources = require('./resources');


var reverse = function() {
    var addr = '';

    if (arguments.length >0 && resources.models.indexOf(arguments[0]) >= 0) {
        addr = '/data/';

        for (var i=0; i<arguments.length; i++) {
            addr += (arguments[i] + '/');
        }
    }

    return addr;
};


module.exports = {
    reverse: reverse
};
