var React = require('react'),
    _ = require('underscore');

var Page = require('./page'),
    Loader = require('../loader');


var FactLog = require('../fact-log'),
    DataModel = require('../data-model'),
    Comparators = require('../comparators');


var items = {
    feed: {
        ident: 'feed',
        path: '/etl/feed/',
        label: 'Feed',
        doc: 'Feed of activity from the ETL pipeline.',
        type: ''
    },
    archives: {
        ident: 'archives',
        path: '/etl/archives/',
        regexp: /^archive\//,
        label: 'Archives',
        doc: 'Index of the data archives received by the DCC and their ' +
             'state in the pipeline.',
        type: ''
    },
    databases: {
        ident: 'databases',
        path: '/etl/databases/',
        regexp: /^database\//,
        label: 'Databases',
        doc: 'Index of the databases that are built and their availability.',
        type: ''
    },
    processes: {
        ident: 'processes',
        path: '/etl/processes/',
        regexp: /^process\//,
        label: 'Processes',
        doc: 'Index of completed ETL processes.',
        type: ''
    }
};


// Ordered list of items for rendering the navigation.
var navigation = [
    'feed',
    'archives',
    'databases',
    'processes'
];


var ETL = React.createClass({
    propTypes: {
        facts: React.PropTypes.array.isRequired,
        item: React.PropTypes.string,
        resource: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            item: navigation[0],
            facts: []
        };
    },

    render: function() {
        var activeItem = items[this.props.item];

        // Navigation links.
        var item, className;

        var navLinks = _.map(navigation, function(ident) {
            className = ident === activeItem.ident ? 'active' : '';

            item = items[ident];

            return (
                <li key={item.ident} className={className}>
                    <a href={item.path}>{item.label}</a>
                </li>
            );
        });

        var content;

        if (activeItem.ident === 'feed') {
            content = (
                <div>
                    <h3>Feed</h3>

                    <FactLog
                        facts={this.props.facts}
                        comparator={Comparators.entityTime}
                    />;
                </div>
            );
        } else {
            var url, regexp;

            var facts = _.filter(this.props.facts, function(fact) {
                return activeItem.regexp.test(fact.Entity.Local);
            });

            content = <DataModel
                label={activeItem.label}
                facts={facts}
                url={activeItem.url}
                resource={this.props.resource}
            />;
        }

        return (
            <Page>
                <div className="page-header">
                    <h3><i className="fa fa-gears" /> ETL <small>The extract, load, and transform (ETL) process managed by the DCC.</small></h3>
                </div>

                <div className="row">
                    <div className="col-md-2">
                        <ul className="nav nav-pills nav-stacked">
                            {navLinks}
                        </ul>
                    </div>

                    <div className="col-md-10">
                        {content}
                    </div>
                </div>
            </Page>
        );
    }
});


module.exports = ETL;
