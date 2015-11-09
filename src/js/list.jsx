var React = require('react'),
    _ = require('underscore');


var Page = require('./pages/page'),
    resources = require('./resources'),
    router = require('./router'),
    Tabs = require('./tabs'),
    Title = require('./title'),
    TitleHelper = require('./title-helper');


var List = React.createClass({
    propTypes: {
        activeTab: React.PropTypes.string,
        baseUrl: React.PropTypes.string,
        description: React.PropTypes.string,
        items: React.PropTypes.array,
        model: React.PropTypes.string.isRequired,
        table: React.PropTypes.string,
        tabList: React.PropTypes.array,
        title: React.PropTypes.object,
        titleFields: React.PropTypes.array,
        titleTables: React.PropTypes.array,
        titleSites: React.PropTypes.array,
        version: React.PropTypes.string.isRequired
    },

    getDefaultProps: function() {
        return {
            items: []
        };
    },

    getInitialState: function() {
        return {
            enabledTabs: {}
        };
    },

    enableTab: function(tab) {
        this.state.enabledTabs[tab] = true;
        this.setState({
            enabledTabs: this.state.enabledTabs
        });
    },
    
    render: function() {
        var model = this.props.model;
        var version = this.props.version;
        var table = this.props.table;

        var elements = _.map(this.props.items, function(item) {
            var name = item.name;
            var description = item.description;

            var url;
            if (table) {
                url = router.reverse(model, version, table, name);
            } 
            else {
                url = router.reverse(model, version, name);
            }

            return (
                 <a key={name} href={url} className='list-group-item'>
                    <h4 className='list-group-item-heading'>{name}</h4>
                    <p className='list-group-item-text'>{description}</p>
                </a>
            );
        }.bind(this));

        var enabledTabs = Object.keys(this.state.enabledTabs);
        var tabs = <Tabs
            key = {enabledTabs.join('_')}
            enabledTabs = {enabledTabs}
            baseUrl = {this.props.baseUrl}
            activeTab = {this.props.activeTab}
            tabList = {this.props.tabList}/>;

        return (
            <Page>
                <div className='margined'>
                    {TitleHelper.renderTitle(this)}
                    <p>{this.props.description}</p>
                </div>
                {tabs}
                <div className='list-group margined'>
                    {elements}
                </div>
            </Page>
        );
    },

});

module.exports = List;
