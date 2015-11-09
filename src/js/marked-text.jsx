var React = require('react'),
    _ = require('underscore'),
    marked = require('marked');

var Page = require('./pages/page'),
    Tabs = require('./tabs'),
    Title = require('./title');
    

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    // sanitize has to be false, otherwise embedded html isn't rendered correctly
    sanitize: false,
    smartLists: true,
    smartypants: false
});

var Element = React.createClass({
    propTypes: {
        title: React.PropTypes.object,
        content: React.PropTypes.string,
        subtitle: React.PropTypes.string,
        description: React.PropTypes.string,
        baseUrl: React.PropTypes.string,
        activeTab: React.PropTypes.string,
        tabList: React.PropTypes.array
    },

    getDefaultProps: function() {
        return {
            content: ''
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
        var contents =
            <div className='paragraph' dangerouslySetInnerHTML={{__html: marked(this.props.content)}} />

        var subtitle;
        if (this.props.subtitle) {
            subtitle = <h4 style={{'margin': '20px'}}>{this.props.subtitle}</h4>;
        }
        
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
                <div className='margined text-box'>
                    {subtitle}
                    {contents}
                </div>
            </Page>
        );
    },
});


module.exports = Element;
