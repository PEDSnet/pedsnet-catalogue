var util = require('./util'),
    links = require('./links');

var defaultOptions = {
    method: 'GET'
};

var send = function(options) {
    options = util.defaults(options, defaultOptions);

    var method = options.method || 'GET',
        url = options.url,
        data;

    // Add parameters to URL
    if (options.params) {
        url = url + '?' + util.params(options.params);
    }

    // Prepare data as JSON if needed
    if (options.data && typeof options.data !== 'string') {
        data = JSON.stringify(options.data);
    }

    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();

        // Open connection
        req.open(method, url, true);

        // Bind handler to know when a response has ocurred
        req.onload = function() {
            var data = this.response;
            
            // This is called even on 404 etc; so check the status
            if (this.status === 200) {
                if (this.getResponseHeader('Content-Type').includes('application/json')) {
                    data = JSON.parse(data);
                }

                var linkHeader = this.getResponseHeader('Link'),
                    linkTemplateHeader = this.getResponseHeader('Link-Template');

                var headerLinks = links.parseHeader(linkHeader),
                    headerLinkTemplates = links.parseHeader(linkTemplateHeader, true);

                // Resolve the promise with the parsed data and xhr
                resolve({
                    code: this.status,
                    status: this.statusText,
                    data: data,
                    links: headerLinks,
                    linkTemplates: headerLinkTemplates
                });
            }
            else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject({
                    code: this.status,
                    status: this.statusText
                });
            }
        };

        // Handle network errors
        req.onerror = function() {
            reject({
                code: 0,
                status: 'network error'
            });
        };

        // Make the request
        if (data) {
            req.setRequestHeader('Content-Type', 'application/json; encoding=utf-8');
        }

        req.send(data);
    });
};


module.exports = {send: send};
