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
        ddl: 'http://reslnpedsndev01.research.chop.edu:6006/',
        dataModel: 'http://reslnpedsndev01.research.chop.edu:6003/models/',
        dqa: 'http://reslnpedsndev01.research.chop.edu:6005/',
        etl: 'http://reslnpedsndev01.research.chop.edu:6001/'
    }
};
