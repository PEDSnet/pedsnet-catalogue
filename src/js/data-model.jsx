var React = require('react'),
    _ = require('underscore');


var CollapsibleText = require('./collapsible-text'),
    DQA = require('./dqa'),
    DQAScoreCard = require('./dqa-scores'),
    resources = require('./resources'),
    router = require('./router'),
    Table = require('./table');


var DataModel = React.createClass({
    propTypes: {
        activeTable: React.PropTypes.string,
        activeField: React.PropTypes.string,
        description: React.PropTypes.string,
        dqa: React.PropTypes.object,
        dqaDict: React.PropTypes.object,
        etlConventions: React.PropTypes.string,
        label: React.PropTypes.string.isRequired,
        name: React.PropTypes.string.isRequired,
        siteComments: React.PropTypes.object,
        tables: React.PropTypes.array.isRequired,
        url: React.PropTypes.string,
        version: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            description: '',
            url: '#'
        };
    },

    getInitialState: function() {
        return {
            collapsedStatus: {}
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
        var titleElement;

        if (this.props.activeTable) {
            var url = router.reverse(this.props.name, version, this.props.activeTable);
            var title = <a href={url}>{this.props.activeTable}</a>

            if (this.props.activeField) {
                title = <p><span>{title}</span>{'/ ' + this.props.activeField} </p>
            }
            else {
                title = <p><span>{title}</span></p>
            }
            titleElement = (
                <li key='title' style={{'marginBottom': 20}}>
                    <h4>
                        {title}
                    </h4>
                </li>
            );
        }

        if (this.props.siteComments) {
            dataDictElement = (
                <li key='data-dict'>
                    <CollapsibleText title={'Site Comments [Implementation Status: ' + this.props.siteComments.status + ']'} 
                                      content={this.props.siteComments.comment}/>
                </li>
            );
        }

        if (description !== '') {
            descriptionElement = (
                <li key='description'>
                    <CollapsibleText title='Description' content={description}/>
                </li>
            );
        }

        if (this.props.etlConventions) {
            etlConventionsElement = (
                <li key='etl'>
                    <CollapsibleText title='ETL Conventions' content={this.props.etlConventions}/>
                </li>
            );
        }

        var dqaTable = this.props.dqa && this.props.dqa[this.props.activeTable];
        var dqaField = dqaTable && dqaTable[this.props.activeField];

        if (dqaTable) {
            if (dqaField) {
                dqaElement = (
                    <li key='dqa'>
                        <DQA data={dqaField} dict={this.props.dqaDict}/>
                    </li>
                );
            }
            else {
                // dqaField can be undefined because no DQA info is available for that field,
                // or because we are displaying table-level info. Address the latter.
                if (!this.props.activeField) {
                    dqaElement = (
                        <li key='dqa'>
                            <DQA data={dqaTable} aggregated={true} dict={this.props.dqaDict}/>
                        </li>
                    );
                }        
            }
        }
        else if (this.props.dqa && !this.props.activeTable) {
            // cumulative score card for all sites across all tables in the model
            dqaElement = (
                <li key='dqa'>
                    <DQAScoreCard data={this.props.dqa}/>
                </li>
            );
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

                <div className='col-md-12' style={{'paddingBottom' : '10px'}}>
                    <a className='external-link' href={urlDDL}>DDL and ERD information</a> 
                </div> 

                <div className='container-fluid fixed-height'>
                    <div className='row fixed-height'>
                        <div className='col-md-4 scrollable' style={{'height': 'calc(100% - 70px)'}}>
                            <ul className='nav nav-pills nav-stacked'>{tables}</ul>
                        </div>
                        <div className='col-md-8 scrollable' style={{'height': 'calc(100% - 70px)'}}>
                            <ul className='nav nav-pills nav-stacked'>
                                {titleElement}
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

    isTableCollapsed: function(tableName) {
        var collapsedStatus = this.state.collapsedStatus;
        // by default, if table is not listed in collapsedStatus, it's collapsed
        return !collapsedStatus.hasOwnProperty(tableName) || collapsedStatus[tableName]
    },

    toggleCollapsed: function(tableName) {
        return function () {
            this.state.collapsedStatus[tableName] = !this.isTableCollapsed(tableName);
            // force re-rendering; otherwise the collapsed/expanded table doesn't 
            // redraw till the next change
            this.forceUpdate();
        }.bind(this);
    }
});


module.exports = DataModel;
