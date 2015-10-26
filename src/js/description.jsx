var React = require('react'),
    _ = require('underscore');


var Page = require('./pages/page'),
    Tabs = require('./tabs');


var Desc = React.createClass({
    propTypes: {
        title: React.PropTypes.object,
        description: React.PropTypes.string,
        baseUrl: React.PropTypes.string,
        activeTab: React.PropTypes.string,
        tabList: React.PropTypes.array
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
                    {this.props.title}
                    <p>{this.props.description}</p>
                </div>
                {tabs}
            </Page>
        );
    },

});

module.exports = Desc;
