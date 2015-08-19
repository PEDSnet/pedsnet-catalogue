define([
    'react',
    'underscore'
], function(React, _) {

    var Domain = React.createClass({
        getDefaultProps: function() {
            return {
                attrs: {}
            };
        },

        render: function() {
            var attrs = this.props.attrs;

            var href = '/domains/' + attrs.Local;

            return (
                <li><a href={href}>{attrs.Local}</a></li>
            );
        }
    });


    var DomainList = React.createClass({
        render: function() {
            var items = _.map(this.props.items, function(item) {
                return <Domain attrs={item} />;
            });

            return <ul>{items}</ul>;
        }
    });


    return React.createFactory(DomainList);
});
