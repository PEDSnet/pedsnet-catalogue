var React = require('react'),
    _ = require('underscore');


var router = require('./router'),
    facts = require('./facts');


var DataModelObject = require('./data-model-object'),
    FactLog = require('./fact-log'),
    Comparators = require('./comparators');


// Takes a set of facts representing whose entities make up a data model.
var DataModel = React.createClass({
    propTypes: {
        facts: React.PropTypes.array.isRequired,
        label: React.PropTypes.string.isRequired,
        doc: React.PropTypes.string,
        resource: React.PropTypes.string,
    },

    render: function() {
        var entities = facts.aggregate(this.props.facts);

        var resource = this.props.resource;

        var items = _.map(entities, function(item) {
            // Check if the item is the selected resource.
            var className = item.ident === resource ? 'active' : '',
                url = router.reverse(item.domain, item.ident);

            return (
                <li key={item.ident} className={className}>
                    <a href={url}>{item.label}</a>
                </li>
            );
        });

        var details, entity, object, log;

        if (this.props.resource) {
            entity = entities.index[this.props.resource];

            if (entity) {
                object = <DataModelObject {...entity} />;

                details = (
                    <div>
                        {object}

                        <hr />

                        <h4>Log</h4>

                        <FactLog facts={entity.facts} comparator={Comparators.time} />
                    </div>
                );
            }
        }

        return (
            <div>
                <h3>{this.props.label}</h3>

                <p className="text-muted">{this.props.doc}</p>

                <div className="row">
                    <div className="col-md-4">
                        <ul className="nav nav-pills nav-stacked">{items}</ul>
                    </div>

                    <div className="col-md-8">
                        {details}
                    </div>
                </div>
            </div>
        );
    }
});


module.exports = DataModel;
