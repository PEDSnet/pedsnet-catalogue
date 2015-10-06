var React = require('react'),
    _ = require('underscore');

var client = require('../client'),
    DataModel = require('../data-model'),
    Loader = require('../loader'),
    Page = require('./page'),
    resources = require('../resources');


var Data = React.createClass({
    propTypes: {
        activeTable: React.PropTypes.string,
        activeField: React.PropTypes.string,
        dqa: React.PropTypes.object,
        dqaDict: React.PropTypes.object,
        etlConventions: React.PropTypes.string,
        modelAllVersions: React.PropTypes.object,
        modelName: React.PropTypes.string.isRequired,
        siteComments: React.PropTypes.object,
        version: React.PropTypes.string
    },

    getDefaultProps: function() {
        return {
            modelAllVersions: {}
        };
    },

    render: function() {
        var versions = Object.keys(this.props.modelAllVersions).sort().reverse();
       
        var version = this.props.version;
        if (!version && versions.length>0) {
            version = versions[0];
        }

        var modelName = this.props.modelName;

        var versionList = _.map(versions, function(ver) {
            return (
                <li key={modelName+ver} className = {ver === version ? 'active' : ''}>
                     <a className='model-version-link' href={'/model/'+modelName+'/'+ver}>{ver}</a>
                </li>
            );
        });
        
        var dataModelLinks = _.map(resources.models, function(model) {
            var isActive = (model === this.props.modelName);
            
            var versionsDropdown = (!isActive || versions.length === 0) ? null :
                <div>
                    <div className='list-group model-version-list'>
                        <ul className='nav nav-pills nav-stacked'>{versionList}</ul>
                    </div>
                </div>

            return (
                <li key={'dm_'+model} className='panel-group data'>
                    <div className='panel panel-default'>
                        <div className={'panel-heading data-model-heading' + (isActive ? ' active' : '')}>
                            <h4 className='panel-title'>
                                <a href={'/model/'+model+'/'+(isActive?version:'')} className = {!isActive ? 'collapsed' : ''}>{model}</a>
                            </h4>
                        </div>
                        {versionsDropdown}
                    </div>
                </li>
            );
        }.bind(this));

        var activeModel;
        if (version && !_.isEmpty(this.props.modelAllVersions)) {
            var activeModel = this.props.modelAllVersions[version];
        }

        /* Note: 
        1) render DataModel every time, and not only when activeModel is set.
           Otherwise the DataModel component will keep getting unmounted and re-mounted,
           thus unable to maintain continous state. 
        2) set key for DataModel to (model name + version), so that the component is re-mounted
           when user navigates between versions. 
        */
        return (
            <Page>
                <div className='page-header' style={{'height': '50px'}}>
                    <h3><i className='fa fa-database' /> Provenance and data quality assessments about the data published by the DCC.</h3>
                </div>

                <div className='row' style={{'height': 'calc(100% - 110px)'}}>
                    <div className='col-md-2'>
                        <ul className='nav nav-pills nav-stacked'>
                            <li className="section">DATA MODELS</li>
                            {dataModelLinks}
                        </ul>
                    </div>

                    <div className='col-md-10 fixed-height'>
                        <DataModel 
                             key={modelName + '_' + version}
                             name={modelName}
                             version={version}
                             label={activeModel ? activeModel.label : ''}
                             description={activeModel ? activeModel.description: ''}
                             tables={activeModel ? activeModel.tables : []}
                             activeTable={this.props.activeTable}
                             activeField={this.props.activeField} 
                             url={activeModel ? activeModel.url : '#'} 
                             etlConventions={this.props.etlConventions}
                             siteComments={this.props.siteComments}
                             dqa={this.props.dqa}
                             dqaDict={this.props.dqaDict}/>
                    </div>
                </div>
            </Page>
        );
    }
});

module.exports = Data;