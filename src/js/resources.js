// Hard-coded URLs to resources of interest.
// TODO: this could be driven by a separate domain.

module.exports = {
    models: ['pedsnet',
             'pcornet',
             'i2b2',
    ],

    dataModelAliases: {
        i2b2: 'i2b2_pedsnet'
    },

    urls: {
        dataDict: 'http://reslnpedsndev01.research.chop.edu:6002/',
        ddl: 'http://dmsa.a0b.io/',
        dataModel: 'http://reslnpedsndev01.research.chop.edu:6003/models/',
        dqa: 'http://127.0.0.1:4321/',
        etl: 'http://reslnpedsndev01.research.chop.edu:6001/',
    },
};