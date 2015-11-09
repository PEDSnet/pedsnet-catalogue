var React = require('react');

var Title = require('./title');

var renderTitle = function (reactComponent) {
    return React.Children.map(reactComponent.props.children, function (child) {
        if (child.type && child.type === Title) {
            return React.addons.cloneWithProps(child, {
                tables: reactComponent.props.titleTables,
                fields: reactComponent.props.titleFields,
                sites: reactComponent.props.titleSites
            });
        }
        else {
            return child;
        }
    });
};

module.exports = {
    renderTitle: renderTitle
};

