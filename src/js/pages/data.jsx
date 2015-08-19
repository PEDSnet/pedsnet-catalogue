var React = require('react'),
    _ = require('underscore');

var Page = require('./page'),
    Loader = require('../loader'),
    DataModel = require('../data-model'),
    FactLog = require('../fact-log'),
    Comparators = require('../comparators');


var dataModels = {
    'pedsnet': {
        ident: 'pedsnet',
        path: '/data/pedsnet/',
        label: 'PEDSnet',
        doc: 'The PEDSnet data model is a superset of the OMOP.',
    },

    'pcornet': {
        ident: 'pcornet',
        path: '/data/pcornet/',
        label: 'PCORnet',
        doc: 'The PCORnet data model is provided by PCORI.',
    },

    'i2b2': {
        ident: 'i2b2',
        path: '/data/i2b2/',
        label: 'i2b2',
        doc: 'The i2b2 data model comes from the i2b2 project.',
    }
};


var navigation = [
    'pedsnet',
    'pcornet',
    'i2b2'
];


var Data = React.createClass({
    propTypes: {
        item: React.PropTypes.string.isRequired,
        resource: React.PropTypes.string,
        facts: React.PropTypes.array
    },

    getDefaultProps: function() {
        return {
            item: navigation[0],
            resource: '',
            facts: []
        };
    },

    render: function() {
        var activeItem = this.props.item;

        var item, className;

        var dataModelLinks = _.map(navigation, function(ident) {
            className = ident === activeItem ? 'active' : '';

            item = dataModels[ident];

            return (
                <li key={item.ident} className={className}>
                    <a href={item.path}>{item.label}</a>
                </li>
            );
        });

        var content;

        if (this.props.item === 'feed') {
            content = (
                <div>
                    <h3>Feed</h3>

                    <FactLog facts={this.props.facts} comparator={Comparators.entityTime} />
                </div>
            );
        } else {
            var model = dataModels[this.props.item];

            if (model) {
                content = <DataModel label={model.label}
                                     doc={model.doc}
                                     facts={this.props.facts}
                                     resource={this.props.resource} />;
            }
        }

        return (
            <Page>
                <div className="page-header">
                    <h3><i className="fa fa-database" /> Data <small>Provenance and data quality assessments about the data published by the DCC.</small></h3>
                </div>

                <div className="row">
                    <div className="col-md-2">
                        <ul className="nav nav-pills nav-stacked">
                            <li className={activeItem === 'feed' ? 'active' : ''}><a href="/data/feed/">Feed</a></li>
                            <li className={activeItem === 'quality' ? 'active' : ''}><a href="/data/quality/">Quality</a></li>
                            <li className="section">DATA MODELS</li>
                            {dataModelLinks}
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


module.exports = Data;
