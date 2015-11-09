var React = require('react'),
    _ = require('underscore');

var resources = require('./resources'),
    router = require('./router');

var Title = React.createClass({
    propTypes: {
        model: React.PropTypes.string.isRequired,
        version: React.PropTypes.string.isRequired,
        table: React.PropTypes.string,
        field: React.PropTypes.string,
        site: React.PropTypes.string,
        activeTab: React.PropTypes.string
    },

    render: function() {
        var model = this.props.model;
        var version = this.props.version;
        var table = this.props.table;
        var field = this.props.field;
        var site = this.props.site;

        var suffix = '';
        if (this.props.activeTab) {
            suffix = this.props.activeTab + '/';
        }

        var stepIn =
            <i className='fa fa-level-up fa-rotate-90'
               style={{
                    'marginLeft': '15px',
                    'marginRight': '15px',
                    'marginTop': '5px'
                }}>
            </i>

        if (!site) {
            var tableElement;
            if (table) {
                tableElement =
                    <div style={{'marginTop': '5px'}}>
                        {stepIn}
                        <i className='fa fa-table' style={{'marginRight': '15px'}}></i>
                        <a href={router.reverse(model, version, table) + suffix}>{table}</a>
                    </div>;
            }

            var fieldElement;
            if (field) {
                fieldElement = 
                    <div style={{'marginLeft': '15px', 'marginTop': '5px'}}>
                        {stepIn}
                        <i className='fa fa-columns' style={{'marginRight': '15px'}}></i>
                        <a href={router.reverse(model, version, table, field) + suffix}>{field}</a>
                    </div>;
            }
            return (
                <h4 className='title'>
                    <div>
                        <i className='fa fa-database' style={{'marginRight': '15px'}}></i>
                        <span>
                            <a href={router.reverse(model, version) + suffix}>
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

            var tableElement;
            if (table) {
                tableElement =
                    <div style={{'marginLeft': '15px', 'marginTop': '5px'}}>
                        {stepIn}
                        <i className='fa fa-table' style={{'marginRight': '15px'}}></i>
                        <a href={router.reverse(model, version, table) + 'dqa/' + site + '/'}>
                            {table}
                        </a>
                    </div>;
            }
            return (
                <h4 className='title'>
                    <div>
                        <i className='fa fa-database' style={{'marginRight': '15px'}}></i>
                        <span>
                            <a href={router.reverse(model, version) + 'dqa/'}>
                                {resources.getModelTitle(model) + ' ' + version + ' Data Model'}
                            </a>
                        </span>
                    </div>
                    <div style={{'marginTop': '5px'}}>
                        {stepIn}
                        <i className='fa fa-h-square' style={{'marginRight': '15px'}}></i>
                        <span>
                            <a href={router.reverse(model, version) + 'dqa/' + site + '/'}>
                                {site}
                            </a>
                        </span>
                    </div>
                    {tableElement}
                </h4>
            );
        }
    },
});

module.exports = Title;
