var React = require('react'),
    _ = require('underscore');

var TimeIntervalMixin = require('./time-interval-mixin');

// Group consecutive facts by entity and timestamp.
var groupFacts = function(facts) {
    var groups = [],
        group = {},
        timestamp;

    for (var i = 0; i < facts.length; i++) {
        var fact = facts[i];

        if (timestamp !== fact.Time) {
            timestamp = fact.Time;

            group = {
                facts: [],
                timestamp: fact.Time / Math.pow(10, 6)
            };

            groups.push(group);
        }

        group.facts.push(fact);
    }


    return groups;
};


var Group = React.createClass({
    mixins: [
        TimeIntervalMixin
    ],

    getDefaultProps: function() {
        return {
            timestamp: null,
            facts: []
        };
    },

    getTimeValue: function() {
        return new Date(this.props.timestamp);
    },

    render: function() {
        var facts = this.props.facts;

        var countLabel = facts.length === 1 ? 'attribute' : 'attributes';

        var items = _.map(facts, function(f, i) {
            var ahref = '/domains/' + (f.Attribute.Domain || f.Domain) + '/aggregate/' + f.Attribute.Local;

            var value;

            if (!f.Value.Local) {
                value = '(empty string)';
            } else {
                var vhref = '/domains/' + (f.Value.Domain || f.Domain) + '/aggregate/' + f.Value.Local;

                value = <a href={vhref}>{f.Value.Local}</a>;
            }

            return (
                <li key={i}>
                    <a href={ahref}>{f.Attribute.Local}</a> set to {value}
                </li>
            );
        });

        var date = this.getTimeValue(),
            timeSince = this.getTimeSince();

        return (
            <div>
                <h5>{facts.length} {countLabel} asserted <span className="timesince" title={date.toLocaleString()}>{timeSince}</span>
                </h5>

                <ul>{items}</ul>
            </div>
        );
    }
});

var ObjectLog = React.createClass({
    getDefaultProps: function() {
        return {
            facts: []
        };
    },

    render: function() {
        var groups = groupFacts(this.props.facts);

        var sections = _.map(groups, function(g, i) {
            return <Group key={i} facts={g.facts} timestamp={g.timestamp} />;
        });

        return <div>{sections}</div>;
    }
});

module.exports = ObjectLog;
