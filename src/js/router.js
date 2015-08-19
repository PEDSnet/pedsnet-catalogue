var reverse = function(domain, local) {
    switch (domain) {
        case 'pedsnet.dcc.loader':
            if (/database\//.test(local)) {
                return '/etl/databases/' + local + '/';
            } else if (/process\//.test(local)) {
                return '/etl/processes/' + local + '/';
            } else if (/archive\//.test(local)) {
                return '/etl/archives/' + local + '/';
            }
            break;
        case 'pcornet.cdm':
            return '/data/pcornet/' + local + '/';
            break;
        case 'pedsnet.cdm':
            return '/data/pedsnet/' + local + '/';
            break;
        case 'i2b2.data':
            return '/data/i2b2/' + local + '/';
            break;
    }

    return '';
};



module.exports = {
    reverse: reverse
};
