var React = require('react'),
    _ = require('underscore');

var router = require('./router');

var Table = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
        model: React.PropTypes.string.isRequired,
        version: React.PropTypes.string.isRequired,
        fields: React.PropTypes.array,
        activeField: React.PropTypes.string,
        parent: React.PropTypes.object,
        isActive: React.PropTypes.bool,
        isCollapsed: React.PropTypes.bool,
        handleClick: React.PropTypes.func.isRequired
    },

    getDefaultProps: function() {
        return {
            fields: [],
            isCollapsed: true,
            isActive: false
        };
    },

    render: function() {
        var activeField = this.props.activeField;
        var model = this.props.model;
        var version = this.props.version;
        var tblName = this.props.name;
        var tblDesc = this.props.description;

        var fields = _.map(this.props.fields, function(field) {
            var url = router.reverse('model', model, version, tblName, field.name);
            /*
            var tooltip_text = (field.required? 'required\n' : '') + 'type: ' + field.type + '\nlength: ' + field.length;
            return (
                <li key={field.name} className = {field.name === activeField ? 'active' : ''}>
                    <a className={field.required ? 'required' : ''} href={url} data-toggle='tooltip' title={tooltip_text}>{field.name}</a>
                </li>
            );
            */
            var info = field.type + '[' + field.length + ']';
            return (
                <li key={field.name} className = {field.name === activeField ? 'active' : ''}>
                     <a className={'table-field' + (field.required ? ' required' : '')} href={url} data-type={info}>{field.name}</a>
                </li>
            );
        });
        
        var fieldsElement;
        if (!this.props.isCollapsed) {
            fieldsElement = (
                <div>
                    <div className='list-group table-field-list'>
                        <ul className='nav nav-pills nav-stacked'>{fields}</ul>
                    </div>
                </div>
            );
        }
        
        var url = router.reverse('model', model, version, tblName);
        
        return (
            <div className='panel-group table'>
                <div className='panel panel-default'>
                    <div className={'panel-heading' + (this.props.isActive ? ' active' : '')}>
                        <h4 className='panel-title'>
                            <a onClick={this.props.handleClick} href={url} 
                               className={this.props.isCollapsed ? 'collapsed' : ''}>{tblName}</a>
                        </h4>
                    </div>
                    {fieldsElement}
                </div>
            </div>
        );
    }
});


module.exports = Table;
