// Extends target with one or more sources
var extend = function(target) {
    if (!target) target = {};

    var sources = [].slice.call(arguments, 1);

    // Combine modules into into exportds
    [].forEach.call(sources, function(s) {
        if (!s) return;

        for (var k in s) {
            target[k] = s[k];
        }
    });

    return target;
};


// Applies defaults to target from one or more sources
var defaults = function(target) {
    if (!target) target = {};

    var sources = [].slice.call(arguments, 1);

    // Combine modules into into exportds
    [].forEach.call(sources, function(s) {
        if (!s) return;

        for (var k in s) {
            if (!target.hasOwnProperty(k)) target[k] = s[k];
        }
    });

    return target;
};

// Convert object in URL encoded parameters. Encoded spaces are replaced
// with the nicer plus (+) character.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
var params = function(params) {
    var toks = [], value;

    for (var key in params) {
        key = encodeURIComponent(key);
        value = encodeURIComponent(params[key].toString());
        toks.push(key + '=' + value);
    }

    return toks.join('&')
        .replace(/[!'()]/g, escape)
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+')
        .replace(/%(?:7C|60|5E)/g, unescape);
};

module.exports = {
    extend: extend,
    defaults: defaults,
    params: params
};
