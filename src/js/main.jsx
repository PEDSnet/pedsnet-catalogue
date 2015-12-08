var React = require('react'),
    page = require('page'),
    _ = require('underscore');


var client = require('./client'),
    DQA = require('./dqa'),
    DQAScores = require('./dqa-scores'),
    Desc = require('./description'),
    env = require('./env'),
    List = require('./list'),
    Header = require('./header'),
    MarkedText = require('./marked-text'),
    Models = require('./pages/models'),
    Page = require('./pages/page'),
    resources = require('./resources'),
    router = require('./router'),
    Title = require('./title');

// list of models for which ETL and DQA info won't be available;
// don't bother trying to fetch it.
var dontFetchETLDQA = {
    pcornet: true
};

// Page-level region of the DOM to render in.
var mainRegion = document.getElementById('main');
var headerRegion = document.getElementById('header');

var fetchDataModel = function(url) {
    return new Promise(function(resolve) {
        client.fetch({url: url, cache: true}).then(function(resp) {
            var dm = {};
            for (var i = 0; i < resp.data.length; i++) {
                dm[resp.data[i].version] = resp.data[i];
            }
            resolve(dm);
        });
    });
};

page('/', function() {
    page.redirect('/models/');
});


page('/models/:model?/:version?/:arg1?/:arg2?/:arg3*', function(cxt) {
    var model = cxt.params.model;
    var version = cxt.params.version;
    var arg1 = cxt.params.arg1;
    var arg2 = cxt.params.arg2;
    var arg3 = cxt.params.arg3;
    var title;
    var tabList;
    var key;

    var component;
    var urlDqaDict = resources.getDQADictURL();

    var header = React.render(
        <Header/>,
        headerRegion
    );

    // if model not specified, list versions for all models;
    // if model is specified but version isn't, list all versions
    // for the given model.

    if (!model || !version) {
        var path;
        if (model) {
            path = ['models', model];
        }
        else {
            path = ['models'];
        }

        component = React.render(
            <Models/>,
            mainRegion
        );
        
        var models = {};

        var urlDataModel;
        if (model) {
            urlDataModel = resources.getDataModelURL(model);
        } 
        else {
            urlDataModel = resources.getDataModelURL();
        }

        client.fetch({url: urlDataModel, cache: true}).then(function(resp) {
            for (var i = 0; i < resp.data.length; i++) {
                var name = resp.data[i].name;
                if (!models[name]) {
                    models[name] = {};
                }
                models[name][resp.data[i].version] = resp.data[i];
            }

            if (!_.isEmpty(models)) {
                component.setProps({
                    models: models
                });
            }
        });

        return;
    }
    
    // if version === 'current', 
    // redirect to the latest version.
    if (version === 'current') {
        var urlDataModel = resources.getDataModelURL(model);
        var path = ['models', model];

        var versions = [];
        client.fetch({url: urlDataModel, cache: true}).then(function(resp) {
            for (var i = 0; i < resp.data.length; i++) {
                versions.push(resp.data[i].version);
            }

            if (versions.length > 0) {
                var v = versions.sort().reverse()[0];
                page.redirect(router.reverse(model, v, arg1, arg2, arg3));
            }
         }).catch(function() {});

        return;
    }

    // Model-level information

    if (arg1 === undefined) {
        arg1='';
    }

    if (['tables', 'etl', 'dqa', ''].indexOf(arg1) >= 0) {
        title = <Title
            model={model}
            version={version}/>;

        tabList = ['tables', 'etl', 'dqa'];
        key = model + '_' + version + '_' + arg1;

        if (arg1 === '') {
            component = React.render(
                <Desc key={key}
                      baseUrl = {router.reverse(model, version)}
                      activeTab = {arg1}
                      tabList = {tabList}>
                    {title}
                </Desc>,
                mainRegion
            );
        }
        else if (arg1 === 'tables') {
            component = React.render(
                <List key={key}
                      model={model}
                      version={version}
                      baseUrl = {router.reverse(model, version)}
                      activeTab = {arg1}
                      tabList = {tabList}>
                    {title}
                </List>,
                mainRegion
            );
        }
        else if (arg1 === 'etl') {
            title = <Title
                model={model}
                version={version}
                activeTab={arg1}/>;

            component = React.render(
                <MarkedText  key={key}
                             baseUrl = {router.reverse(model, version)}
                             activeTab = {arg1}
                             tabList = {tabList}>
                    {title}
                </MarkedText>,
                mainRegion
            );
        }
        else if (arg1 === 'dqa') {
            title = <Title
                model={model}
                version={version}
                site={arg2}
                activeTab='dqa'/>;

            component = React.render(
                <DQAScores key={key}
                           baseUrl = {router.reverse(model, version)}
                           activeTab = {arg1}
                           tabList = {tabList}>
                    {title}
                </DQAScores>,
                mainRegion
            );
        }

        var urlDataModel = resources.getDataModelURL(model, version);
        client.fetch({url: urlDataModel, cache: true}).then(function(resp) {
            if (resp.data && resp.data.tables && !_.isEmpty(resp.data.tables)) {
                // only redirect to the default tab here, because now we actually do know
                // that the info for that tab is actually available.
                if (arg1 === '') {
                    page.redirect(router.reverse(model, version, 'tables'));
                    return;
                }

                var tableNames = resp.data.tables.map(function(obj) {
                    return obj.name;
                });

                if (arg1 === 'tables') {
                    component.setProps({
                        items: resp.data.tables,
                        titleTables: tableNames
                    });
                }
                else {
                    component.setProps({
                        titleTables: tableNames
                    });
                }


                component.enableTab('tables');
            }
        }).catch(function() {});

        if (!dontFetchETLDQA[model]) {
            var urlETL = resources.getETL_URL(model, version);
            client.fetch({url: urlETL, cache: true}).then(function(resp) {
                if (resp.data && resp.data.model && resp.data.model.content) {
                    var content = resp.data.model.content;

                    if (arg1 === 'etl') {
                        component.setProps({
                            content: content
                        });
                    }

                    component.enableTab('etl');
                }
            }).catch(function() {});

            var urlDQA = resources.getDQA_URL(model, version);
            
            // site-specific DQA requested:
            // first fetch the list of available sites (the list is used in the title),
            // then adjust the DQA url, so that the next fetch gets us this site's data
            if (arg1 === 'dqa' && arg2) {
                var urlSiteList = resources.getDQASiteListURL(model, version);

                client.fetch({url: urlSiteList, cache: true}).then(function(resp) {
                    if (resp.data && !_.isEmpty(resp.data)) {
                        component.setProps({
                            titleSites: resp.data
                        });
                    }
                }).catch(function() {});

                component.setProps({
                    tabList: ['dqa']
                });

                // adjust the url so that the next block fetches this site's data
                urlDQA += arg2;
            }

            client.fetch({url: urlDQA, cache: true}).then(function(resp) {
                if (resp.data && !_.isEmpty(resp.data)) {
                    if (arg1 === 'dqa') {
                        component.setProps({
                            data: resp.data,
                            siteSpecific: (arg2 !== undefined && arg2 !== ''),
                            siteName: arg2
                        });
                    }

                    component.enableTab('dqa');
                }
            }).catch(function() {});
        }

        return;
    }    

    // Table-level information
    
    if (arg2 === undefined) {
        arg2='';
    }

    // site comments are only available on field level
    if (arg2 === 'site_comments') {
        arg2='';
    }

    title = <Title
        model={model}
        version={version}
        table={arg1}/>;

    tabList = ['fields', 'etl', 'dqa'];
    key = model + '_' + version + '_' + arg1 + '_' + arg2;

    if (['fields', 'etl', 'dqa', ''].indexOf(arg2) >= 0) {
        if (arg2 === '') {
            component = React.render(
                <Desc key={key}
                      baseUrl = {router.reverse(model, version, arg1)}
                      activeTab = {arg2}
                      tabList = {tabList}>
                    {title}
                </Desc>,
                mainRegion
            );
        }
        else if (arg2 === 'fields') {
            component = React.render(
                <List key={key}
                      model={model}
                      version={version}
                      table={arg1}
                      baseUrl = {router.reverse(model, version, arg1)}
                      activeTab = {arg2}
                      tabList = {tabList}>
                    {title}
                </List>,
                mainRegion
            );
        }
        else if (arg2 === 'etl') {
            title = <Title
                model={model}
                version={version}
                table={arg1}
                activeTab='etl'/>;

            component = React.render(
                <MarkedText key={key}
                            baseUrl = {router.reverse(model, version, arg1)}
                            activeTab = {arg2}
                            tabList = {tabList}>
                    {title}
                </MarkedText>,
                mainRegion
            );
        }
        else if (arg2 === 'dqa') {
            title = <Title
                model={model}
                version={version}
                table={arg1}
                site={arg3}
                activeTab='dqa'/>;

            component = React.render(
                <DQA key={key}
                     baseUrl = {router.reverse(model, version, arg1)}
                     activeTab = {arg2}
                     tabList = {tabList}>
                    {title}
                </DQA>,
                mainRegion
            );
        }

        // set table and field lists for the dropdown in the title
        if (!(arg2 === 'dqa' && arg3)) {
            //table list
            var urlDataModel = resources.getDataModelURL(model, version);
            client.fetch({url: urlDataModel, cache: true}).then(function(resp) {
                if (resp.data && resp.data.tables && !_.isEmpty(resp.data.tables)) {
                    var tableNames = resp.data.tables.map(function(obj) {
                        return obj.name;
                    });

                    var t = _.find(resp.data.tables, function(t) {
                        return (t.name === arg1);
                    });
                    var fieldNames = t.fields.map(function(f) {
                        return f.name;
                    });

                    component.setProps({
                        titleTables: tableNames,
                        titleFields: fieldNames
                    });
                }
            }).catch(function() {});
        }
        else {
            var urlDQA = resources.getDQA_URL(model, version) + arg3 + '/';
            client.fetch({url: urlDQA, cache: true}).then(function(resp) {
                if (resp.data) {
                    component.setProps({
                        titleTables: Object.keys(resp.data)
                    });
                }
            }).catch(function() {});
        }

        var urlDataModel = resources.getDataModelURL(model, version, arg1);
        client.fetch({url: urlDataModel, cache: true}).then(function(resp) {
            if (resp.data && resp.data.fields && !_.isEmpty(resp.data.fields)) {
                if (arg2 === '') {
                    page.redirect(router.reverse(model, version, arg1, 'fields'));
                    return;
                }

                if (arg2 === 'fields') {
                    component.setProps({
                        items: resp.data.fields,
                        description: resp.data.description
                    });
                }
                else if (!(arg2 === 'dqa' && arg3)) {
                    component.setProps({
                        description: resp.data.description
                    });                
                }

                component.enableTab('fields');
            }
        }).catch(function() {});

        if (!dontFetchETLDQA[model]) {
            var urlETL = resources.getETL_URL(model, version);
            client.fetch({url: urlETL, cache: true}).then(function(resp) {
                if (resp.data && resp.data.model && resp.data.model.tables && resp.data.model.tables[arg1]) {
                    var content = resp.data.model.tables[arg1].content;

                    if (content) {
                        if (arg2 === 'etl') {
                            component.setProps({
                                content: content
                            });
                        }

                        component.enableTab('etl');
                    }
                }
            }).catch(function() {});

            var urlDQA = resources.getDQA_URL(model, version, arg1);

            // site-specific DQA requested:
            // first fetch the list of sites that have an issue against this table 
            // (this list is needed for the dropdown menu in the title);
            // then adjust the DQA url, so that the next fetch gets us this site's data
            if (arg2 === 'dqa' && arg3) {
                var urlSiteList = resources.getDQASiteListURL(model, version, arg1);
                client.fetch({url: urlSiteList, cache: true}).then(function(resp) {
                    if (resp.data && !_.isEmpty(resp.data)) {
                        component.setProps({
                            titleSites: resp.data
                        });
                    }
                }).catch(function() {});

                component.setProps({
                    tabList: ['dqa']
                });

                // adjust the url so that the next block fetches this site's data
                urlDQA += arg3;
            }

            client.fetch({url: urlDQA, cache: true}).then(function(resp) {
                if (resp.data && !_.isEmpty(resp.data)) {
                    if (arg2 === 'dqa') {
                        component.setProps({
                            aggregated: true,
                            siteSpecific: (arg3 !== undefined && arg3 !== ''),
                            siteName: arg3,
                            data: resp.data
                        });
                    }
                    
                    component.enableTab('dqa');
                }
            }).catch(function() {});

            client.fetch({url: urlDqaDict, cache: true}).then(function(resp) {
                if (resp.data && !_.isEmpty(resp.data)) {
                    if (arg2 === 'dqa') {
                        component.setProps({
                            dict: resp.data
                        });
                    }    
                }
            }).catch(function() {});
        }

        return;
    }

    // Field-level information
    
    if (arg3 === undefined) {
        arg3='';
    }

    title = <Title
        model={model}
        version={version}
        table={arg1}
        field={arg2}
        activeTab={arg3}/>;

    tabList = ['etl', 'dqa', 'site_comments'];
    key = model + '_' + version + '_' + arg1 + '_' + arg2 + '_' + arg3;

    if (['etl', 'dqa', 'site_comments', ''].indexOf(arg3) >= 0) {
        if (arg3 === '') {
            title = <Title
                model={model}
                version={version}
                table={arg1}
                field={arg2}/>;

            component = React.render(
                <Desc key={key}
                      baseUrl = {router.reverse(model, version, arg1, arg2)}
                      activeTab = {arg3}
                      tabList = {tabList}>
                    {title}
                </Desc>,
                mainRegion
            );
        }
        else if (arg3 === 'etl') {
            component = React.render(
                <MarkedText key={key}
                            baseUrl = {router.reverse(model, version, arg1, arg2)}
                            activeTab = {arg3}
                            tabList = {tabList}>
                    {title}
                </MarkedText>,
                mainRegion
            );
        }
        else if (arg3 === 'dqa') {
            component = React.render(
                <DQA key={key}
                     baseUrl = {router.reverse(model, version, arg1, arg2)}
                     activeTab = {arg3}
                     tabList = {tabList}>
                    {title}
                </DQA>,
               mainRegion
            );
        }
        else if (arg3 === 'site_comments') {
            component = React.render(
                <MarkedText key={key}
                            baseUrl = {router.reverse(model, version, arg1, arg2)}
                            activeTab = {arg3}
                            tabList = {tabList}>
                    {title}
                </MarkedText>,
                mainRegion
            );
        }

        // set table list for the dropdown in the title
        var urlDataModel = resources.getDataModelURL(model, version);
        client.fetch({url: urlDataModel, cache: true}).then(function(resp) {
            if (resp.data && resp.data.tables && !_.isEmpty(resp.data.tables)) {
                var tableNames = resp.data.tables.map(function(obj) {
                    return obj.name;
                });

                component.setProps({
                    titleTables: tableNames
                });
            }
        }).catch(function() {});

        // set field list for the dropdown in the title
        var urlDataModel = resources.getDataModelURL(model, version, arg1);
        client.fetch({url: urlDataModel, cache: true}).then(function(resp) {
            if (resp.data && resp.data.fields && !_.isEmpty(resp.data.fields)) {
                var fieldNames = resp.data.fields.map(function(obj) {
                    return obj.name;
                });

                component.setProps({
                    titleFields: fieldNames
                });
            }
        }).catch(function() {});

        // get field description
        var urlDataModel = resources.getDataModelURL(model, version, arg1, arg2);
        client.fetch({url: urlDataModel, cache: true}).then(function(resp) {
            if (resp.data && resp.data.description) {
                component.setProps({
                    description: resp.data.description
                });                
            }
        }).catch(function() {});

        if (!dontFetchETLDQA[model]) {
            var urlETL = resources.getETL_URL(model, version);
            client.fetch({url: urlETL, cache: true}).then(function(resp) {
                if (resp.data && resp.data.model && resp.data.model.tables && resp.data.model.tables[arg1]
                              && resp.data.model.tables[arg1].fields) {
                    var content = resp.data.model.tables[arg1].fields[arg2].etl_conventions;
                    if (content) {
                        if (arg3 === '') {
                            page.redirect(router.reverse(model, version, arg1, arg2, 'etl'));
                            return;
                        }

                        if (arg3 === 'etl') {
                            component.setProps({
                                content: content
                            });
                        }

                        component.enableTab('etl');
                    }
                }
            }).catch(function() {});

            var urlDQA = resources.getDQA_URL(model, version, arg1, arg2);
            client.fetch({url: urlDQA, cache: true}).then(function(resp) {
                if (resp.data && !_.isEmpty(resp.data)) {
                    if (arg3 === 'dqa') {
                        component.setProps({
                            aggregated: false,
                            data: resp.data
                        });
                    }
                
                    component.enableTab('dqa');
                }
            }).catch(function() {});

            client.fetch({url: urlDqaDict, cache: true}).then(function(resp) {
                if (resp.data && arg3 === 'dqa') {
                    component.setProps({
                        dict: resp.data
                    });
                }
            }).catch(function() {});
        }
        
        // site comments originate from the annotated data dictioanry and 
        // are only available on the field level

        var urlDataDict = resources.getDataDictURL(model, version);
        var siteComments = {};
        client.fetch({url: urlDataDict, cache: true}).then(function(resp) {
            if (resp.data && resp.data.model && resp.data.model[arg1]
                          && resp.data.model[arg1][arg2]) {
                if (arg3 === 'site_comments') {
                    component.setProps({
                        subtitle: 'Status: ' + resp.data.model[arg1][arg2].implementation_status,
                        content: resp.data.model[arg1][arg2].site_comments
                    });
                }
            
                component.enableTab('site_comments');
            }            
        }).catch(function() {});
    }
});

// Catch-all for 404.
var NotFound = require('./pages/404');

page('*', function(cxt, next) {
    var component = <NotFound />;

    React.render(component, mainRegion);
});

// Set the base path
if (env.root) {
    page.base(env.root);
}

// Start the routing.
page.start();