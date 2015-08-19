var React = require('react');

// A PEDSnet object corresponds to a record in a PEDSnet data warehouse table
// such as Person, VisitOccurrence, Death, etc.
var PEDSnetRecord = React.createClass({
    render: function() {
        return (
            <div>
                <h3>{this.props.ident}</h3>
            </div>
        );
    }
});


module.exports = PEDSnetRecord;
