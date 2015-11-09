var React = require('react'),
    _ = require('underscore');

var FixedDataTable = require('fixed-data-table'),
    Column = FixedDataTable.Column,
    Page = require('./pages/page'),
    Table = FixedDataTable.Table,
    Tabs = require('./tabs'),
    Title = require('./title');

var Helper = require('./table-helper');

var isColumnResizing;
var width = 80;

var SortTypes = {
    ASC: 'ASC',
    DESC: 'DESC'
};
       
var DQA = React.createClass({
    propTypes: {
        title: React.PropTypes.object,
        aggregated: React.PropTypes.bool,
        data: React.PropTypes.object,
        dict: React.PropTypes.object,
        description: React.PropTypes.string,
        siteSpecific: React.PropTypes.bool,
        siteName: React.PropTypes.string,
        baseUrl: React.PropTypes.string,
        activeTab: React.PropTypes.string,
        tabList: React.PropTypes.array
    },

    getDefaultProps: function() {
        return {
            aggregated: false,
            data: {},
            dict: {},
            siteSpecific: false
        };
    },

    getInitialState: function() {
        return {
            columnWidths: {
                code: width,
                desc: 5*width,
                status: 2*width,
                names: 5*width
            },
            rows: {},
            sortBy: 'code',
            sortDir: SortTypes.ASC,
            tableWidth: 500,
            enabledTabs: {}
        };
    },

    enableTab: function(tab) {
        this.state.enabledTabs[tab] = true;
        this.setState({
            enabledTabs: this.state.enabledTabs
        });
    },

    _renderSiteTableLink: function(cellData) {
        // Link to the DQA report for the given site.
        // If we are linking from table level, link to the site's report for the same table.
        // Otherwise link to top-level DQA for the site. 
        
        var baseUrl = location.href;
        // there may or may not be a '#' or a '/' at the end,
        // so it's easier to just chop off and re-construct the 'dqa' suffix
        baseUrl = baseUrl.substring(0, baseUrl.indexOf('dqa'));
        
        if (!this.props.aggregated) {
            baseUrl = baseUrl.split('/');
            baseUrl = baseUrl.slice(0, -3);
            baseUrl = baseUrl.join('/');
            baseUrl += '/';
        }

        baseUrl += 'dqa/';

        var sites = cellData.split(' ');
        var links = sites.map(function(record) {
            var siteName;

            if (this.props.aggregated) {
                siteName = record.substring(0, record.indexOf('('));
            }
            else if (record.indexOf(',') >= 0) {
                siteName = record.substring(0, record.indexOf(','));
            }
            else {
                siteName = record;
            }

            siteName = siteName.trim();
            
            return (<a key={record} href={baseUrl + siteName}>{record + ' '}</a>);
        }.bind(this));

        return links;
    },

    _getRows: function(props, sortBy) {
        var code;
        var desc;
        var rows = [];
        var status;
        var entries;

        if (!sortBy) {
            sortBy = this.state.sortBy;
        }

        for (code in props.data) {
            desc = props.dict[code]? props.dict[code].desc : '';

            for (status in props.data[code]) {
                if (props.siteSpecific) {
                    entries = [];

                    props.data[code][status].forEach(function(entry) {
                        entries.push(entry.field);
                    });
                }
                else if (props.aggregated) {
                    entries = [];
                    for (site in props.data[code][status]) {
                        entries.push(site + '(' + props.data[code][status][site].length + ')');
                    }
                }
                else {
                    entries = props.data[code][status].map(function(obj) {
                        return obj.site;
                    });
                }

                // if the table is sorted by site/field name, list the names individually;
                // if the table is sorted by anything other than site/field name, 
                // keep the names grouped by (code + status)
                if (sortBy === 'names') {
                    entries.forEach(function(entry) {
                        rows.push({
                            code: code,
                            desc: desc,
                            status: (Helper.statusList[status] && Helper.statusList[status].label) || status,
                            names: entry
                        });
                    });
                }
                else {
                    entries = entries.reduce(function(a,b) {
                        return a + ', ' + b;
                    });

                    rows.push({
                        code: code,
                        desc: desc,
                        status: (Helper.statusList[status] && Helper.statusList[status].label) || status,
                        names: entries
                    });
                }
            }
        }
        return rows;
    },

    componentWillReceiveProps: function(nextProps) {
        var mergedProps = this.props;
        for (var prop in nextProps) {
            mergedProps[prop] = nextProps[prop];
        }

        this.setState({
            rows: this._getRows(mergedProps)
        })
    },

    componentWillMount: function() {
        this.setState({
            rows: this._getRows(this.props),
        })
    },

    componentDidMount: function() {
        // set a timeout for updating width, otherwise everything on the page gets
        // re-mounted on any navigation. I don't quite understand why, but somehow 
        // this is caused by the fact that _updateWidth accesses dimentions of an element.
        setTimeout(Helper.updateWidth(this));

        Helper.addResizeListener(this);
    },

    _sortRowsBy: function(sortBy) {
        var sortDir = this.state.sortDir;

        // if we are sorting by the same column as we sorted last time,
        // reverse the sort order;
        // otherwise pick the default (ascending) order.
        if (sortBy === this.state.sortBy) {
          sortDir = this.state.sortDir === SortTypes.ASC ? SortTypes.DESC : SortTypes.ASC;
        }
        else {
          sortDir = SortTypes.ASC;
        }
        
        var rows = this._getRows(this.props, sortBy).slice();

        if(sortBy === 'status') {
            var statusList = Helper.statusList;
            
            rows.sort(function(a, b) {
                var sortVal = 0;

                if (statusList[a[sortBy]].sortOrder > statusList[b[sortBy]].sortOrder) {
                    sortVal = 1;
                }
                else if (statusList[a[sortBy]].sortOrder < statusList[b[sortBy]].sortOrder) {
                    sortVal = -1;
                }

                if (sortDir === SortTypes.DESC) {
                    sortVal = sortVal * -1;
                }

                return sortVal;
            });

        }
        else {
            rows.sort(function(a, b) {
                var sortVal = 0;

                if (a[sortBy] > b[sortBy]) {
                    sortVal = 1;
                }
                else if (a[sortBy] < b[sortBy]) {
                    sortVal = -1;
                }

                if (sortDir === SortTypes.DESC) {
                    sortVal = sortVal * -1;
                }

                return sortVal;
            });
        }

        this.setState({
          rows: rows,
          sortBy: sortBy,
          sortDir: sortDir
        });
    },    

    _renderHeader: function(label, cellDataKey) {
        var sortSymbol;

        // we added a '#' and a suffix to force header re-rendering.
        // get rid of this.
        label = label.split('#')[0];

        if (cellDataKey !== this.state.sortBy) {
            sortSymbol = 'fa fa-sort';
        }
        else if (this.state.sortDir === SortTypes.ASC) {
            sortSymbol = 'fa fa-sort-asc';
        }
        else {
            sortSymbol = 'fa fa-sort-desc';
        }

        return (
            <span>
                <span style={{'fontWeight': '400'}}>{label}</span>
                <a onClick={this._sortRowsBy.bind(null, cellDataKey)}>
                    <i className={sortSymbol + ' sort-arrow'}></i>
                </a>
            </span>
        );
    },



    render: function() {
        var rowHeight = 30;
        var headerHeight = 50;
        var numRows = this.state.rows.length;
        
        var sortDirArrow = '';
    
        if (this.state.sortDir !== null){
          sortDirArrow = this.state.sortDir === SortTypes.ASC ? (' ' + String.fromCharCode(9660)) : 
                                                                (' ' + String.fromCharCode(9650));
        }

        var contents;

        // For site-specific reports the 'names' column holds
        // the list of field names for which an issue with a given code was reported.
        // For non-site-specific reports this column holds the list of site names
        // for which an issue with a given code was reported.

        var nameColumnLabel;
        var nameColumnRenderer;

        if (this.props.siteSpecific) {
            nameColumnLabel = 'Fields';
        }
        else {
            nameColumnLabel = 'Sites';
            nameColumnRenderer = this._renderSiteTableLink;
        }

        // if the table is empty, don't render the table, but still render 
        // the 'tableContainer' div because updateWidth() uses 'tableContainer' 
        // as a reference for correct table width, and updateWidth() is called 
        // when the element is mounted. 

        // make sure there's a change to the column label when sort direction changes.
        // This is a hack, but I don't know how else to trigger header re-drawing 
        // besides changing the label. 
   
        if (!_.isEmpty(this.state.rows)) {
            contents =
                <Table
                    rowHeight={rowHeight}
                    rowGetter={Helper.rowGetter(this)}
                    rowsCount={numRows}
                    width={this.state.tableWidth}
                    height={headerHeight + (numRows+0.5)*rowHeight + 2}
                    headerHeight={headerHeight}
                    overflowX='auto'
                    isColumnResizing={isColumnResizing}
                    onColumnResizeEndCallback={Helper.onColumnResizeEndCallback(this, isColumnResizing)}
                    >

                    <Column
                        width={this.state.columnWidths['code']}
                        isResizable={true}
                        dataKey={'code'}
                        fixed={true}
                        headerRenderer={this._renderHeader}
                        label={'Code' + '#' + (this.state.sortBy === 'code' ? this.state.sortDir : '')}
                    />
                    <Column
                        width={this.state.columnWidths['desc']}
                        isResizable={true}
                        dataKey={'desc'}
                        headerRenderer={this._renderHeader}
                        label={'Description' + '#' + (this.state.sortBy === 'desc' ? this.state.sortDir : '')}
                    />
                    <Column
                        width={this.state.columnWidths['status']}
                        isResizable={true}
                        dataKey={'status'}
                        headerRenderer={this._renderHeader}
                        label={'Status' + '#' + (this.state.sortBy === 'status' ? this.state.sortDir : '')}
                    />
                    <Column
                        width={this.state.columnWidths['names']}
                        isResizable={true}
                        dataKey={'names'}
                        headerRenderer={this._renderHeader}
                        label={nameColumnLabel + '#' + (this.state.sortBy === 'names' ? this.state.sortDir : '')}
                        cellRenderer={nameColumnRenderer}
                    />
                </Table>
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
                <div id='tableContainer' className='panel-group dqa margined'>
                    {contents}
                </div>
            </Page>
        );
    }
});

module.exports = DQA;
