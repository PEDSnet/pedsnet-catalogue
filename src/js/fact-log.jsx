var React = require('react'),
    _ = require('underscore');

var TimeIntervalMixin = require('./time-interval-mixin');


// Group consecutive facts delegated by the comparator function.
var groupFacts = function(facts, comparator) {
    var groups = [],
        group = {},
        last;

    for (var i = 0; i < facts.length; i++) {
        var fact = facts[i];

        if (!last || !comparator(last, fact)) {
            group = {
                facts: [],
                timestamp: fact.Time / Math.pow(10, 6)
            };

            groups.push(group);
        }

        group.facts.push(fact);

        last = fact;
    }


    return groups;
};


var FactLogGroup = React.createClass({
    mixins: [
        TimeIntervalMixin
    ],

    propTypes: {
        facts: React.PropTypes.array.isRequired,
        local: React.PropTypes.string,
        domain: React.PropTypes.string,
        timestamp: React.PropTypes.number,
    },

    getTimeValue: function() {
        return new Date(this.props.timestamp);
    },

    render: function() {
        var facts = this.props.facts;

        var countLabel = facts.length === 1 ? 'attribute' : 'attributes';

        var attrLink, valueLink, value;

        var items = _.map(facts, function(f, i) {
            // Link to the attribute.
            attrLink = '/catalogue/' + (f.Attribute.Domain || f.Domain) + '/' + f.Attribute.Local;

            var value;

            if (!f.Value.Local) {
                value = '(empty string)';
            } else {
                valueLink = '/catalogue/' + (f.Value.Domain || f.Domain) + '/' + f.Value.Local;

                value = <a href={valueLink}>{f.Value.Local}</a>;
            }

            return (
                <li key={i}>
                    <a href={attrLink}>{f.Attribute.Local}</a> set to {value}
                </li>
            );
        });

        var date = this.getTimeValue(),
            timeSince = this.getTimeSince();

        var entityLink = '/domains/' + this.props.domain + '/aggregate/' + this.props.local,
            domainLink = '/domains/' + this.props.domain + '/';

        var header;

        if (this.props.local) {
            header = (
                <h5>{facts.length} {countLabel} asserted for <a href={entityLink}>{this.props.local}</a>
                    {' '}<span className="timesince" title={date.toLocaleString()}>{timeSince}</span>
                </h5>
            );
        } else {
            header = (
                <h5>{facts.length} {countLabel} asserted
                    {' '}<span className="timesince" title={date.toLocaleString()}>{timeSince}</span>
                </h5>
            );
        }

        return (
            <div>
                {header}

                <ul>{items}</ul>
            </div>
        );
    }
});

var FactLog = React.createClass({
    propTypes: {
        facts: React.PropTypes.array.isRequired,
        comparator: function(props, propName, componentName) {
            if (!props[propName] || typeof props[propName] !== 'function') {
                throw new Error(componentName + ' comparator function required.');
            }
        }
    },

    getDefaultProps: function() {
        return {
            facts: [],
            comparator: null
        };
    },

    render: function() {
        var groups = groupFacts(this.props.facts, this.props.comparator);

        var sections = _.map(groups, function(g, i) {
            return <FactLogGroup key={i}
                    facts={g.facts}
                    timestamp={g.timestamp} />;
        });

        return <div>{sections}</div>;
    }
});

module.exports = FactLog;
