var React = require('react'),
    _ = require('underscore');

var Loader = require('../loader'),
    Page = require('./page'),
    resources = require('../resources'),
    router = require('../router'),
    Tabs = require('../tabs');


var Models = React.createClass({
    propTypes: {
        models: React.PropTypes.object
    },

    getDefaultProps: function() {
        return {
            models: {}
        };
    },

    render: function() {
        var tabs = <Tabs 
            key = 'tabs_models'
            baseUrl = '/'
            activeTab = 'models'
            enabledTabs = {['models']}
            tabList = {['models']}/>;

        var modelNames = resources.models;

        var modelElements = _.map(modelNames, function(name) {
            var aliasedName = resources.getAliasedName(name);

            var model = this.props.models[aliasedName];
            if (!model || _.isEmpty(model)) {
                return <div key={name}></div>;
            }

            var urlDDL = resources.getDDL_URL(aliasedName);

            var versions = Object.keys(model).sort().reverse();

            var currentVersion = model[versions[0]];
            var url = currentVersion.url;

            var description = currentVersion.description;
            if (description) {
                description = <p>{description}</p>;
            }

            versions = _.map(versions, function(ver) {
                urlVersion = router.reverse('model', name, ver);
                return (
                    <li key={name + '_' + ver} className='list-group-item'>
                        <a href={urlVersion}>{ver}</a>
                    </li>
                );
            });

            return (
                <div key={name} className='col-md-4'
                     style={{'padding': '20px'}}>
                    <div className='page-header' style={{'height': '30px', marginTop: 0}}>
                        <h3>
                            <a href={router.reverse('model', name)} style={{'textDecoration': 'none'}}>
                                {resources.dataModelTitles[aliasedName]}
                            </a>
                        </h3>
                    </div>
                    <div style={{'paddingBottom': '5px'}} >
                        <a className='external-link' href={url}>Project Information</a>
                    </div>
                    <div>
                        {description}
                    </div>
                    <div style={{'paddingBottom': '5px'}} >
                        <a className='external-link' href={urlDDL}>DDL and ERD Information</a>
                    </div>
                    <div className='list-group container-fluid'>
                        <p style={{'paddingTop': '10px', 'paddingBottom': '10px'}}>
                            Versions:
                        </p>
                        <ul className='list-group'>
                            {versions}
                        </ul>
                    </div>
                </div>
            );
        }.bind(this));

        return (
            <Page>
                {tabs}
                <div>
                    {modelElements}
                </div>
            </Page>
        );
    }
});

module.exports = Models;