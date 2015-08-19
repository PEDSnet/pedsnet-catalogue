var url = require('url-template');

var parseHeader = function(header, template) {
    if (!header) return;

    var links = {},
        entries = header.split(',');

    // compile regular expressions ahead of time for efficiency
    var relsRegExp = /\brel="?([^"]+)"?\s*;?/,
        keysRegExp = /(\b[0-9a-z\.-]+\b)/g,
        sourceRegExp = /^<(.*)>/;

    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i].trim();
        var rels = relsRegExp.exec(entry);

        if (rels) {
            var keys = rels[1].match(keysRegExp);
            var source = sourceRegExp.exec(entry)[1];

            for (var k = 0; k < keys.length; k++) {
                links[keys[k]] = template ? url.parse(source) : source;
            }
        }
    }

    return links;
};

module.exports = {
    parseHeader: parseHeader
};
