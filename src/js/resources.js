var _ = require('underscore');

// Get the top-level service URLs.
var urls = require('./env').serviceURLs;

module.exports = {
    models: ['pedsnet',
             'pcornet',
             'i2b2',
    ],

    dataModelAliases: {
        i2b2: 'i2b2_pedsnet'
    },

    dataModelTitles: {
        i2b2: 'i2b2',
        i2b2_pedsnet: 'i2b2 for PEDSnet',
        pedsnet: 'PEDSnet',
        pcornet: 'PCORnet'
    },

    getModelTitle: function(modelName) {
        return this.dataModelTitles[modelName] || modelName;
    },

    getAliasedName: function(modelName) {
        return this.dataModelAliases[modelName] || modelName;
    },

    getAliasedModelNames: function() {
        return _.map(this.models, function(name) {
            return this.getAliasedName(name);
        }.bind(this));
    },

    getDataModelURL: function(model, version, table, field) {
        var url = urls.dataModel;

        if(model) {
            url += (this.dataModelAliases[model] || model);

            if (version) {
                url += '/' + version;

                if (table) {
                    url += '/' + table;

                    if (field) {
                        url += '/' + field;
                    }
                }
            }
        }

        return  url + '?format=json';
    },

    getDDL_URL: function(model, version) {
        model = this.dataModelAliases[model] || model;
        return urls.ddl + model + '/' + (version ? (version + '/') : '');
    },

    getETL_URL: function(model, version) {
        return urls.etl + model + '?version=' + version;
    },

    getDataDictURL: function(model, version) {
        return urls.dataDict + model + '/' + version;
    },

    getDQA_URL: function(model, version, table, field) {
        if (!table) {
            return urls.dqa + model + '/' + version + '/site-totals/';
        }

        if (!field) {
            return urls.dqa + model + '/' + version + '/table-totals/' + table + '/';
        }

        return urls.dqa + model + '/' + version + '/field-totals/' + table + '/' + field + '/';
    },

    getDQASiteListURL: function(model, version, table) {
        if (!table) {
            return urls.dqa + model + '/' + version + '/site-list/';
        }

        return urls.dqa + model + '/' + version + '/site-list/' + table + '/';
    },

    getDQADictURL: function() {
        return urls.dqa + 'dictionary/';
    }
};
