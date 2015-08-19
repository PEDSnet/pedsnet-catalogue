var React = require('react'),
    _ = require('underscore');

var Page = require('./page'),
    Loader = require('../loader');


var dataModels = [
    {
        ident: 'pedsnet',
        label: 'PEDSnet',
        doc: 'The PEDSnet data model is a superset of the OMOP.'
    }, {
        ident: 'pcornet',
        label: 'PCORnet',
        doc: 'The PCORnet data model is provided by PCORI.'
    }, {
        ident: 'i2b2',
        label: 'i2b2',
        doc: 'The i2b2 data model comes from the i2b2 project.'
    }
];


// The catalogue
var Catalogue = React.createClass({
    getDefaultProps: function() {
        return {
            item: dataModels[0].ident
        };
    },

    render: function() {
        var activeItem = this.props.item;

        var navLinks = _.map(dataModels, function(item) {
            var className = item.ident === activeItem ? 'active' : '';

            return (
                <li key={item.ident} className={className}>
                    <a href={'/catalogue/' + item.ident + '/'}>{item.label}</a>
                </li>
            );
        });

        return (
            <Page>
                <div className="page-header">
                    <h3><i className="fa fa-book" /> Catalogue <small>Various resources used by PEDSnet.</small></h3>
                </div>

                <div className="row">
                    <div className="col-md-2">
                        <ul className="nav nav-pills nav-stacked">
                            {navLinks}
                        </ul>
                    </div>

                    <div className="col-md-10">
                        {this.props.dataModel}
                    </div>
                </div>
            </Page>
        );
    }
});


module.exports = Catalogue;
