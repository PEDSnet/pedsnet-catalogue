var React = require('react'),
    _ = require('underscore');


// Renders an object that represents a data model element. The passed
// object has the format:
// - ident - The identity of the object.
// - label - A human-readable label.
// - doc - Documentation or description of the object.
// - time - Timestamp of the last change made to the object.
// - facts - Array of facts for this object.
// - attrs - Set of latest facts for each attribute.
var DataModelObject = React.createClass({
    propTypes: {
        ident: React.PropTypes.string.isRequired,
        label: React.PropTypes.string,
        doc: React.PropTypes.string,
        time: React.PropTypes.number,
        facts: React.PropTypes.array,
        attrs: React.PropTypes.array
    },

    render: function() {
        var rows = _.map(this.props.attrs, function(item) {
            var date = new Date(item.time / 1000);

            return (
                <tr key={item.ident} title={'Asserted on ' + date.toLocaleString()}>
                    <th>{item.attr}</th>
                    <td>{item.value}</td>
                </tr>
            );
        });

        return (
            <div>
                <h4>{this.props.label}</h4>

                <p className="text-muted">{this.props.doc}</p>

                <table className="table table-condensed">
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
});


module.exports = DataModelObject;
