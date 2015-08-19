var React = require('react'),
    page = require('page');


// Page-level region of the DOM to render in.
var mainRegion = document.getElementById('main');


var client = require('./client'),
    resources = require('./resources');


// Pages
var Dashboard = require('./pages/dashboard'),
    ETL = require('./pages/etl'),
    Data = require('./pages/data'),
    DataModelObject = require('./data-model-object');


page('/', function() {
    var component = React.render(<Dashboard />, mainRegion);

    // ETL activity
    client.fetch({url: resources.etl, cache: true}).then(function(resp) {
        component.setProps({
            etlActivity: resp.data
        });
    });

    // Data activity
    client.fetch({url: resources.warehouse, cache: true}).then(function(resp) {
        component.setProps({
            dataActivity: resp.data
        });
    });
});


page('/etl/:page?/:resource*', function(cxt) {
    if (!cxt.params.page) {
        page.redirect('/etl/feed/');
        return;
    }

    // All pages currently use this URL.
    var url = resources.etl;

    var component = React.render(
        <ETL item={cxt.params.page}
            resource={cxt.params.resource}
        />,
        mainRegion);

    if (url) {
        client.fetch({url: url, cache: true}).then(function(resp) {
            component.setProps({
                facts: resp.data
            });
        });
    }
});


page('/data/:page?/:resource*', function(cxt) {
    if (!cxt.params.page) {
        page.redirect('/data/feed/');
        return;
    }

    var url;

    switch (cxt.params.page) {
        case 'feed':
            url = resources.warehouse;
            break;
        case 'pedsnet':
            url = resources.pedsnet;
            break;
        case 'i2b2':
            url = resources.i2b2;
            break;
        case 'pcornet':
            url = resources.pcornet;
            break;
    }

    var component = React.render(<Data item={cxt.params.page} resource={cxt.params.resource} />, mainRegion);

    if (url) {
        client.fetch({url: url, cache: true}).then(function(resp) {
            component.setProps({
                facts: resp.data
            });
        });
    }
});


page('/catalogue/:domain/:ident+', function(cxt) {
    var component = React.render(<DataModelObject />, mainRegion);

    var url = '/domains/' + cxt.params.domain + '/aggregate/' + cxt.params.ident;

    client.fetch({url: url, cache: true}).then(function(resp) {
        component.setProps({
            object: resp.data
        });
    });
});


// Catch-all for 404.
var NotFound = require('./pages/404');

page('*', function(cxt, next) {
    var component = <NotFound />;

    React.render(component, mainRegion);
});

// Start the routing.
page.start();
