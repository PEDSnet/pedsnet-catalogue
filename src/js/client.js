var xhr = require('./xhr');


// Cache of responses by URL.
var cache = {};

// Client provides an interface to a remote resource.
var send = function(method, options) {
    if (typeof method === 'object') {
        options = method;
    } else {
        options = options || {};
        options.method = method;
    }

    // URL function which implies it depends on client to be
    // ready before being evaluated
    if (typeof options.url === 'function') {
        options.url = options.url();
    } else if (!options.url) {
        throw new Error('url required');
    }

    // Cache is true and already cached.
    if (options.cache && cache[options.url]) {
        return new Promise(function(resolve, reject) {
            resolve(cache[options.url]);
        });
    }

    return xhr.send(options).then(function(response) {
        if (options.cache) {
            cache[options.url] = response;
        }

        return response;
    });
};

var fetch = function(options) {
    return send('GET', options);
};

var create = function(options) {
    return send('POST', options);
};

var update = function(options) {
    return send('PUT', options);
};

var remove = function(options) {
    return send('DELETE', options);
};


module.exports = {
    send: send,
    fetch: fetch,
    create: create,
    update: update,
    remove: remove
};
