var React = require('react'),
    _ = require('underscore');


var CollapsibleText = require('./collapsible-text'),
    Dqa = require('./dqa'),
    resources = require('./resources'),
    Table = require('./table');


var DataModel = React.createClass({
    propTypes: {
        name: React.PropTypes.string.isRequired,
        version: React.PropTypes.string,
        tables: React.PropTypes.array.isRequired,
        label: React.PropTypes.string.isRequired,
        description: React.PropTypes.string,
        activeTable: React.PropTypes.string,
        activeField: React.PropTypes.string,
        url: React.PropTypes.string,
        etlConventions: React.PropTypes.string,
        siteComments: React.PropTypes.object,
        dqa: React.PropTypes.object,
    },

    getDefaultProps: function() {
        return {
            description: '',
            url: '#',
        };
    },

    getInitialState: function() {
        return {
            collapsedStatus: {},
            tableWidth: 600,
        };
    },
    
    render: function() {
        var version = this.props.version;

        var description = this.props.description;
        if (this.props.tables && this.props.tables.length>0 && this.props.activeTable) {
            var table = _.find(this.props.tables, function(f) { 
                return f.name === this.props.activeTable; 
            }.bind(this));

            if (this.props.activeField) {
                description = _.find(table.fields, function(f) { 
                    return f.name === this.props.activeField; 
                }.bind(this)).description;

                // if a field is selected, the table shouldn't be collapsed
                this.state.collapsedStatus[table.name] = false;
            }
            else {
                description = table.description;
            }
        }
        
        var tables = _.map(this.props.tables, function(table) {
            var isActiveTable = (table.name === this.props.activeTable);
            return (
                <li key={table.name}>
                    <Table model={this.props.name} 
                       version={version}
                       name={table.name}
                       fields={table.fields}
                       isActive = {isActiveTable} 
                       activeField = {isActiveTable? this.props.activeField : ''}
                       isCollapsed = {this.isTableCollapsed(table.name)}
                       handleClick = {this.toggleCollapsed(table.name)}/>
                </li>
            );
        }.bind(this));
        
        var dataDictElement;
        var descriptionElement;
        var dqaElement;
        var etlConventionsElement;

        if (this.props.siteComments) {
            dataDictElement =
                <li key='data-dict'>
                    <CollapsibleText title={'Site Comments [Implementation Status: ' + this.props.siteComments.status + ']'} 
                                      content={this.props.siteComments.comment}/>
                </li>
        }

        if (description !== '') {
            descriptionElement =
                <li key='description'>
                    <CollapsibleText title='Description' content={description}/>
                </li>;
        }

        if (this.props.etlConventions) {
            etlConventionsElement =
                <li key='etl'>
                    <CollapsibleText title='ETL Conventions' content={this.props.etlConventions}/>
                </li>
        }

        var dqaTable = this.props.dqa && this.props.dqa[this.props.activeTable];
        var dqaField = dqaTable && dqaTable.fields[this.props.activeField];

        if (dqaTable !== undefined && dqaField !== undefined) {
                <li key='dqa'>
                    <Dqa width={this.state.tableWidth} 
                         data={this.props.dqa[dqaTable][dqaField]}/>
                </li>
        }

        var model = this.props.name;
        model = resources.dataModelAliases[model] || model
        var urlDDL = (resources.urls.ddl + model + '/' +
                     (version ? (version + '/') : ''));
            
        return (
            <div className='fixed-height'>
                <h3 className='col-md-12 title-link'>
                    <a className='external-link' href={this.props.url}>{this.props.label}</a>
                </h3>

                <a className='col-md-12 external-link' style={{'paddingBottom' : '10px'}} href={urlDDL}>DDL and ERD information</a> 

                <div className='container-fluid fixed-height'>
                    <div className='row fixed-height'>
                        <div className='col-md-4 scrollable' style={{'height': 'calc(100% - 70px)'}}>
                            <ul className='nav nav-pills nav-stacked'>{tables}</ul>
                        </div>
                        <div className='col-md-8 scrollable' style={{'height': 'calc(100% - 70px)'}}>
                            <ul className='nav nav-pills nav-stacked'>
                                {descriptionElement}
                                {etlConventionsElement}
                                {dataDictElement}
                                {dqaElement}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    componentDidMount: function() {
        // there has to be a better way to size the table correctly, but this will do for now.
        // (TODO figure out a cleaner way to do this)
        var component = document.getElementById('dqaContainer');
        if (component) {
            this.setState({
                tableWidth : component.clientWidth
            });
        }
    },

    isTableCollapsed: function(tableName) {
        var collapsedStatus = this.state.collapsedStatus;
        // by default, if table is not listed in collapsedStatus, it's collapsed
        return !collapsedStatus.hasOwnProperty(tableName) || collapsedStatus[tableName]
    },

    toggleCollapsed: function(tableName) {
        return function () {
            this.state.collapsedStatus[tableName] = !this.isTableCollapsed(tableName);
            this.forceUpdate(); // otherwise the collapsed/expanded table doesn't redraw till the next change
        }.bind(this);
    },
});


module.exports = DataModel;
