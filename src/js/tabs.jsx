var React = require('react'),
    _ = require('underscore');

var TAB_NAMES = {
    models: 'Data Models',
    fields: 'Fields',
    tables: 'Tables',
    etl: 'ETL Conventions',
    dqa: 'Data Quality',
    site_comments: 'Site Comments'
};

var Tabs = React.createClass({
    propTypes: {
        baseUrl: React.PropTypes.string,
        activeTab: React.PropTypes.string,
        tabList: React.PropTypes.array,
        enabledTabs: React.PropTypes.array
    },

    getDefaultProps: function() {
        return {
            baseUrl: '/',
            activeTab: '',
            tabList: [],
            enabledTabs: []
        };
    },

    getInitialState: function() {
        return {
            enabled: {}
        };
    },

    enable: function(tab) {
        this.state.enabled[tab] = true;
    },

    componentWillMount: function() {
        this.props.enabledTabs.forEach(function(tab) {
            this.enable(tab);
        }.bind(this));
    },

    render: function() {
        var tabs = _.map(this.props.tabList, function(tab) {
            var className = '';

            if (tab === this.props.activeTab) {
                className = 'active';
            }

            if (!this.state.enabled[tab]) {
                className = 'disabled';
            }

            var url = '';
            if (this.state.enabled[tab]) {
                url = this.props.baseUrl + tab + '/';
            }

            return (
                <li role='presentation' className={className} key={'tab'+tab}>
                    <a href={url}>{TAB_NAMES[tab] || tab}</a>
                </li>
            );
        }.bind(this));

        return (
            <nav className='margined'>
                <ul className="nav nav-tabs">
                    {tabs}
                </ul>
            </nav>
        );
    },
});

module.exports = Tabs;
