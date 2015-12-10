var React = require('react'),
    _ = require('underscore');

var DropdownButton = require('react-bootstrap').DropdownButton,
    MenuItem = require('react-bootstrap').MenuItem;

var resources = require('./resources'),
    router = require('./router');

var Title = React.createClass({
    propTypes: {
        activeTab: React.PropTypes.string,
        field: React.PropTypes.string,
        fields: React.PropTypes.array,
        model: React.PropTypes.string.isRequired,
        site: React.PropTypes.string,
        sites: React.PropTypes.array,
        table: React.PropTypes.string,
        tables: React.PropTypes.array,
        version: React.PropTypes.string.isRequired
    },

    render: function() {
        var menuItems;
        var model = this.props.model;
        var field = this.props.field;
        var fields = this.props.fields;
        var table = this.props.table;
        var tableElement;
        var tables = this.props.tables;
        var site = this.props.site;
        var sites = this.props.sites;
        var spacer = <span style={{'marginLeft': '10px'}}></span>;
        var version = this.props.version;

        if (sites) {
            sites.sort();
        }

        var suffix = '';
        if (this.props.activeTab) {
            suffix = this.props.activeTab;
        }

        var stepIn = <i id='step-in' className='fa fa-level-up fa-rotate-90'/>;

        if (!site) {
            var fieldElement;
            var fieldDropdown;
            var removeField;

            if (table && field) {
                removeField = (
                    <a href={router.reverse('model', model, version, table, suffix)}>
                        <i className='fa fa-remove'></i>
                    </a>
                );                            
            }

            menuItems = undefined;
            if (tables) {
                menuItems = _.map(tables, function(el) {
                    var dropdownURL = router.reverse('model', model, version, el, suffix);
                    return (<MenuItem key={el+'_dropdown'} href={dropdownURL}>{el}</MenuItem>);
                });
            }

            var tableTitle;
            if (table) {
                tableTitle = table;
            }
            else {
                tableTitle = '...';
            }

            tableElement = (
                <div>
                    <div style={{'marginTop': '5px'}}>
                        {stepIn}
                        <i className='fa fa-table initial'></i>
                        <DropdownButton title={tableTitle} id='dropdown' className='dropdown'>
                            {menuItems}
                        </DropdownButton>
                    </div>
                </div>
            );

            menuItems = undefined;
            if (fields) {
                menuItems = _.map(fields, function(el) {
                    var dropdownURL = router.reverse('model', model, version, table, el, suffix);
                    return (<MenuItem key={el+'_dropdown'} href={dropdownURL}>{el}</MenuItem>);
                });
            }

            if (table) {
                if (field) {
                    fieldDropdown = (
                        <span>
                            <i className='fa fa-columns initial'></i>
                            <DropdownButton title={field} id='dropdown' className='dropdown'>
                                {menuItems}
                            </DropdownButton>
                            {spacer}
                            {removeField}
                        </span>
                    );
                }
                else {
                    fieldDropdown = (
                        <span>
                            <i className='fa fa-columns initial'></i>
                            <DropdownButton title={'...'} id='dropdown' className='dropdown'>
                                {menuItems}
                            </DropdownButton>
                        </span>
                    );
                }

                fieldElement = (
                    <div style={{'marginLeft': '15px'}}>
                        {stepIn}
                        {fieldDropdown}
                    </div>
                );
            }

            return (
                <h4 className='title'>
                    <div>
                        <i className='fa fa-database initial'></i>
                        <span>
                            <a href={router.reverse('model', model, version, suffix)}>
                                {resources.getModelTitle(model) + ' ' + version + ' Data Model'}
                            </a>
                        </span>
                    </div>
                    {tableElement}
                    {fieldElement}
                </h4>
            );
        }
        else {
            // site-specific DQA info
            var removeSite;

            tableElement = undefined;
            if (table) {
                var removeTable = (
                    <a href={router.reverse('model', model, version, 'dqa', site)}>
                        <i className='fa fa-remove'></i>
                    </a>
                );                            

                menuItems = undefined;
                if (tables) {
                    menuItems = _.map(tables, function(el) {
                        var dropdownURL = router.reverse('model', model, version, el, 'dqa', site);
                        return (<MenuItem key={el+'_dropdown'} href={dropdownURL}>{el}</MenuItem>);
                    });
                }

                tableElement = (
                    <div style={{'marginLeft': '15px'}}>
                        {stepIn}
                        <i className='fa fa-table initial'></i>
                        <DropdownButton title={table} id='dropdown' className='dropdown'>
                            {menuItems}
                        </DropdownButton>
                        {spacer}
                        {removeTable}
                    </div>
                );
 
                removeSite = (
                    <a href={router.reverse('model', model, version, table, 'dqa')}>
                        <i className='fa fa-remove'></i>
                    </a>
                );                            
            }

            menuItems = undefined;
            if (sites) {
                menuItems = _.map(sites, function(s) {
                    var dropdownURL;
                    if (table) {
                        dropdownURL = router.reverse('model', model, version, table, 'dqa', s);
                    }
                    else {
                        dropdownURL = router.reverse('model', model, version, 'dqa', s);
                    }
                    return (<MenuItem key={s+'_dropdown'} href={dropdownURL}>{s}</MenuItem>);
                });
            }

            return (
                <h4 className='title'>
                    <div>
                        <i className='fa fa-database initial'></i>
                        <span>
                            <a href={router.reverse('model', model, version, 'dqa')}>
                                {resources.getModelTitle(model) + ' ' + version + ' Data Model'}
                            </a>
                        </span>
                    </div>
                    <div style={{'marginTop': '5px'}}>
                        {stepIn}
                        <i className='fa fa-h-square initial'></i>
                        <DropdownButton title={site} id='dropdown' className='dropdown'>
                            {menuItems}
                        </DropdownButton>
                        {spacer}
                        {removeSite}                            
                    </div>
                    {tableElement}
                </h4>
            );
        }
    },
});

module.exports = Title;
