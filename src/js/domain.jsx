define([
    'react',
    'underscore',
    './fact-log'
], function(React, _, FactLog) {

    var Domain = React.createClass({
        getDefaultProps: function() {
            return {
                identity: {},
                facts: []
            };
        },

        render: function() {
            var ident = this.props.identity;

            return (
                <div>
                    <h2>{ident.Local}</h2>

                    <FactLog facts={this.props.facts} />
                </div>
            );
        }
    });


    return React.createFactory(Domain);
});
