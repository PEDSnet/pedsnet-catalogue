var React = require('react'),
    _ = require('underscore'),
    marked = require('marked');

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

var Collapsible = React.createClass({
    propTypes: {
        title: React.PropTypes.string.isRequired,
        content: React.PropTypes.string,
    },

    getDefaultProps: function() {
        return {
            content: '',
        };
    },

    getInitialState: function() {
        return {
            isCollapsed: false,
        };
    },

    render: function() {
        var contents = this.state.isCollapsed ? null: 
            <div className='paragraph' dangerouslySetInnerHTML={{__html: marked(this.props.content)}} />

        return (
            <div className='panel-group'>
                <div className='panel panel-default'>
                    <div className='panel-heading' onClick={this.handleClick}>
                        <h4 className='panel-title'>
                            <span className = {this.state.isCollapsed ? 'collapsed' : ''}>{this.props.title}</span>
                        </h4>
                    </div>
                    {contents}
                </div>
            </div>
        );
    },

    handleClick: function() {
        this.setState({
            isCollapsed : !this.state.isCollapsed
        });
    },
});


module.exports = Collapsible;
