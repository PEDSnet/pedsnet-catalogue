var React = require('react'),
    page = require('page');


// Page-level region of the DOM to render in.
var mainRegion = document.getElementById('main');


var client = require('./client');
var resources = require('./resources');


// Pages
var Data = require('./pages/data');


page('/', function() {
    page.redirect('/data/');
});


page('/data/:model?/:version?/:table?/:field*', function(cxt) {
    var model = cxt.params.model;
    var table = cxt.params.table;
    var field = cxt.params.field;
    var version = cxt.params.version;

    if (!model) {
        if (resources.models.length > 0) {
            page.redirect('/data/'+resources.models[0]+'/');
        }
        return;
    }

    var component = React.render(<Data modelName = {model} 
                                       activeTable = {table} 
                                       activeField = {field}
                                       version = {version}/>,
                                 mainRegion);

    var fetchDataModel = function(url) {
        return new Promise(function(resolve) {
            client.fetch({url: url, cache: true}).then(function(resp) {
                var dm = {};
                for (var i = resp.data.length-1; i >= 0; i--) {
                    dm[resp.data[i].version] = resp.data[i];
                }
                resolve(dm);
            });
        });
    };

    var urlDataModel = resources.urls.dataModel +
                       (resources.dataModelAliases[model] || model) + '?format=json';
    fetchDataModel(urlDataModel).then(function(resp) {
        // if version wasn't specified in the url, redirect to the highest version
        var versions = Object.keys(resp);
        if (!version && versions.length>0) {
            page.redirect('/data/'+model+'/'+versions.sort().reverse()[0]);
        } else {
            component.setProps({
                modelAllVersions: resp
            });
        }
    });

    if (version) {
        var urlETL = resources.urls.etl + model + '?version=' + version;

        client.fetch({url: urlETL, cache: true}).then(function(resp) {
            var etlContent = '';
            if (table) {
                if (field) {
                    etlContent = resp.data.model.tables[table].fields[field].etl_conventions;
                } else {
                    etlContent = resp.data.model.tables[table].content;
                }
            } else {
                // model-level etl conventions
                etlContent = resp.data.model.content;
            }

            component.setProps({
                etlConventions: etlContent
            });
        }).catch(function() {});
    }

    // site comments are only available on the field level
    if (field) {
        urlDataDict = resources.urls.dataDict + model + '/' + version;
        client.fetch({url: urlDataDict, cache: true}).then(function(resp) {
            component.setProps({
                siteComments: { 
                    status: resp.data.model[table][field].implementation_status,
                    comment: resp.data.model[table][field].site_comments,  
                }
            });
        }).catch(function() {});
    }

    if (field) { 
        urlDQA = resources.urls.dqa + model + '/' + version;
        client.fetch({url: urlDQA, cache: true}).then(function(resp) {
            component.setProps({
                dqa: resp.data
            });
        }).catch(function() {});
    }
});

// Catch-all for 404.
var NotFound = require('./pages/404');

page('*', function(cxt, next) {
    var component = <NotFound />;

    React.render(component, mainRegion);
});

// Start the routing.
page.start();