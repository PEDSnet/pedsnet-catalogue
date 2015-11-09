var React = require('react'),
    _ = require('underscore');


var Page = require('./pages/page'),
    Tabs = require('./tabs'),
    TitleHelper = require('./title-helper');


var Desc = React.createClass({
    propTypes: {
        activeTab: React.PropTypes.string,
        baseUrl: React.PropTypes.string,
        description: React.PropTypes.string,
        tabList: React.PropTypes.array,
        title: React.PropTypes.object,
        titleFields: React.PropTypes.array,
        titleTables: React.PropTypes.array
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
        TitleHelper.renderTitle(this);

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
            </Page>
        );
    },

});

module.exports = Desc;
