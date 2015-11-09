var React = require('react'),
    _ = require('underscore');

var OverlayTrigger = require('react-bootstrap').OverlayTrigger,
    Tooltip = require('react-bootstrap').Tooltip;

var FixedDataTable = require('fixed-data-table'),
    Column = FixedDataTable.Column,
    Page = require('./pages/page'),
    Table = FixedDataTable.Table,
    Tabs = require('./tabs'),
    Title = require('./title');

var Helper = require('./table-helper');

var isColumnResizing;

var SortTypes = {
    ASC: 'ASC',
    DESC: 'DESC'
};
      
var DQAScores = React.createClass({
    propTypes: {
        title: React.PropTypes.object,
        columnWidth: React.PropTypes.number,
        data: React.PropTypes.object,
        description: React.PropTypes.string,
        siteSpecific: React.PropTypes.bool,
        siteName: React.PropTypes.string,
        baseUrl: React.PropTypes.string,
        activeTab: React.PropTypes.string,
        tabList: React.PropTypes.array
    },

    getDefaultProps: function() {
        return {
            columnWidth: 230,
            data: {},
            siteSpecific: false
        };
    },

    getInitialState: function() {
        return {
            columnWidths: {},
            rows: {},
            sortBy: null,
            sortDir: null,
            statusList: [],
            tableWidth: 500,
            enabledTabs: {},
            maxValue: 100
        };
    },
    
    enableTab: function(tab) {
        this.state.enabledTabs[tab] = true;
        this.setState({
            enabledTabs: this.state.enabledTabs
        });
    },
    
    _renderLink: function(cellData) {
        // Link to the DQA totals for the given site
        var url = location.href;
        // there may or may not be a '#' or a '/' at the end,
        // so it's easier to just chop off and re-construct the 'dqa' suffix
        url = url.substring(0, url.indexOf('dqa'));
        url += 'dqa/' + cellData + '/';

        return <a href={url}>{cellData}</a>;
    },

    _renderTableLink: function(cellData) {
        // Link to the DQA information for this table, specific to the given site 
        var url = location.href;
        url = url.substring(0, url.indexOf('dqa')-1);
        url += '/' + cellData + '/dqa/' + this.props.siteName + '/';

        return <a href={url}>{cellData}</a>;
    },

    _renderBar: function(cellData, cellDataKey,
                         rowData, rowIndex,
                         columnData, width) {
        var value = parseInt(cellData, 10);

        var bar;
        if (value > 0) {
            bar = <span style={{'width': (value / this.state.maxValue * (width-60)).toString()+'px'}} className='bar'></span>
        }
        return (
            <span>
                <span className='number'>{cellData}</span> 
                {bar}
            </span>
        );
    },

    _calcColumnWidth: function(s) {
        // TODO actually figure out the length of the string in pixels
        s = (Helper.statusList[s] && Helper.statusList[s].label) || s;
        return 11*s.length;
    },

    _initRows: function(props) {
        var row;
        var rows = [];
        var score;
        var maxValue = 0;

        var totals = {};
        totals['active'] = 0;

        // all sites have the same status list, so grab the list from 
        // any of the available sites.
        var anySiteData = props.data[Object.keys(props.data)[0]];
        
        var statusList = [];
        if(anySiteData) {
            statusList = Object.keys(anySiteData);
        }

        var statusWeights = {};
        
        statusList.forEach(function(status) {
            statusWeights[status] = 1;
        });

        statusWeights['persistent'] = 0;
        statusWeights['withdrawn'] = 0;
        statusWeights['non-issue'] = 0;
        statusWeights['closed'] = 0;

        for (var name in props.data) {
            row = _.clone(props.data[name]);

            score = 0;
            for (var key in row) {
                score += row[key] * statusWeights[key];

                if (row[key] > maxValue) {
                    maxValue = row[key];
                }

                if (totals[key]) {
                    totals[key] += row[key];
                } 
                else { 
                    totals[key] = row[key];
                }
            }
            row.active = score;
            row.name = name;

            rows.push(row);

            if (score > maxValue) {
                maxValue = score;
            }

            totals['active'] += score;
        }

        // initial sort is by score, in descending order
        var sortBy = 'active';
        rows.sort(function(a, b) {
            var sortVal = 0;

            if (a[sortBy] > b[sortBy]) {
                sortVal = -1;
            }
            else if (a[sortBy] < b[sortBy]) {
                sortVal = 1;
            }

            return sortVal;
        });
    
        return [rows, totals, maxValue];
    },

    _sortRowsBy: function(sortBy) {
        var sortDir = this.state.sortDir;

        // if we are sorting by the same column as we sorted last time,
        // reverse the sort order;
        // otherwise pick the default order (ascending for site/table names,
        // descending for scores).
        if (sortBy === this.state.sortBy) {
            sortDir = this.state.sortDir === SortTypes.ASC ? SortTypes.DESC : SortTypes.ASC;
        }
        else {
            if (sortBy === 'name') {
                sortDir = SortTypes.ASC;
            }
            else {
                sortDir = SortTypes.DESC;
            }
        }
        
        var rows = this.state.rows;
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
        
        this.setState({
          rows: rows,
          sortBy: sortBy,
          sortDir: sortDir
        });
    },

    getInitContents: function(props) {
        // all sites have the same status list, so grab the list from 
        // any of the available sites
        var anySiteData = props.data[Object.keys(props.data)[0]];

        var statusList = [];
        if(anySiteData) {
            statusList = Object.keys(anySiteData);
        }
        
        // For site-specific reports the 'name' column holds table names,
        // and for non-site-specific reports this column holds site names.
        // Table names can be long, but site names are pretty short,
        // so choose column width accordingly.
        var titleColumnWidth = props.siteSpecific ? 
                                this._calcColumnWidth('condition_occurrence') :
                                this._calcColumnWidth('Nationwide');

        var columnWidths = {
            name: titleColumnWidth,
            active: this.props.columnWidth
        };

        statusList.forEach(function(status) {
            columnWidths[status] = this.props.columnWidth;
        }.bind(this));
        
        var ret = this._initRows(props);
        var rows = ret[0];
        var totals = ret[1];
        var maxValue = ret[2];
        return {
            columnWidths: columnWidths,
            rows: rows,
            sortBy: 'active',
            sortDir: SortTypes.DESC,
            statusList: statusList,
            columnTotals: totals,
            maxValue: maxValue
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState(this.getInitContents(nextProps));
    },

    componentWillMount: function() {
        this.setState(this.getInitContents(this.props));
    },

    componentDidMount: function() {
        // set a timeout for updating width, otherwise everything on the page gets
        // re-mounted on any navigation. I don't quite understand why, but somehow 
        // this is caused by the fact that _updateWidth accesses dimentions of an element.
        setTimeout(Helper.updateWidth(this));

        Helper.addResizeListener(this);
    },

    _renderHeader: function(label, cellDataKey) {
        var tooltip_text = '';
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

        if (Helper.statusList[cellDataKey]) {
            tooltip_text = Helper.statusList[cellDataKey].desc;
        }

        // TODO figure out how to get the tooltip to show up on click,
        // not on hover over. 
        var info;
        if (cellDataKey !== 'name') {

            var tooltip = (
              <Tooltip id='issue_type_descr'>{tooltip_text}</Tooltip>
            );

            info = (
                <OverlayTrigger placement='top' overlay={tooltip}>
                    <i className='fa fa-info-circle'></i>
                </OverlayTrigger>
            );
        } 

        var badge;
        var total = this.state.columnTotals[cellDataKey];
        if (cellDataKey !== 'name' && total!==undefined) {
            badge = <span className='badge'>{total}</span>;
        } 

        return (
            <span>
                <span style={{'fontWeight': '400'}}>{label}</span>
                {info}
                {badge}
                <a onClick={this._sortRowsBy.bind(null, cellDataKey)}>
                    <i className={sortSymbol + ' sort-arrow'}></i>
                </a>
            </span>
        );
    },

    render: function() {
        var colWidth = this.props.columnWidth;
        var rowHeight = 30;
        var headerHeight = 50;
        var numRows = this.state.rows.length || 0;
        var statusList = Helper.statusList;
        
        // columns should be displayed in the order specified by statusList[]
        var statusList = _.clone(this.state.statusList).sort(function (a, b) {
            // for columns that don't have a sort order defined, we'll pick the
            // default order that will places them just before the non-issue column(s).
            // This is so that we don't ignore any new status that may get introduced
            // into the reports; this will also let us catch any potential misspellings.
            if (!(a in statusList)) {
                a = 'default';
            }
            if (!(b in statusList)) {
                b = 'default';
            }
            if (statusList[a].sortOrder > statusList[b].sortOrder) { 
                return 1;
            }
            else if (statusList[a].sortOrder < statusList[b].sortOrder) {
                return -1;
            }
            return 0;
        });

        var statusColumns = _.map(statusList, function(status) {
            var label = (Helper.statusList[status] && Helper.statusList[status].label) || status;

            // make sure there's a change to the column label when sort direction changes.
            // This is a hack, but I don't know how else to trigger header re-rendering 
            // besides changing the label. 
            return (
                <Column
                    key={status}
                    width={this.state.columnWidths[status] || colWidth}
                    isResizable={true}
                    dataKey={status}
                    headerRenderer={this._renderHeader}
                    label={label + '#' + (this.state.sortBy === status ? this.state.sortDir : '')}
                    cellRenderer={this._renderBar}
                />
            );
        }.bind(this));

        // For site-specific reports the 'name' column holds table names,
        // and for non-site-specific reports this column holds site names.

        var nameColumnLabel;
        var nameColumnRenderer;

        if(!this.props.siteSpecific) {
            nameColumnLabel = 'site';
            nameColumnRenderer = this._renderLink;
        }
        else {
            nameColumnLabel = 'table';
            nameColumnRenderer = this._renderTableLink;
        }

        var contents;
        
        // if the table is empty, don't render the table, but still render 
        // the 'tableContainer' div because updateWidth() uses 'tableContainer' 
        // as a reference for correct table width, and updateWidth() is called 
        // when the element is mounted. 
        
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
                        width={this.state.columnWidths['name'] || colWidth}
                        isResizable={true}
                        dataKey={'name'}
                        fixed={true}
                        headerRenderer={this._renderHeader}
                        label={nameColumnLabel + '#' + (this.state.sortBy === 'name' ? this.state.sortDir : '')}
                        cellRenderer={nameColumnRenderer}
                    />
                    <Column
                        width={this.state.columnWidths['active'] || colWidth}
                        isResizable={true}
                        dataKey={'active'}
                        headerRenderer={this._renderHeader}
                        label={'active' + '#' + (this.state.sortBy === 'active' ? this.state.sortDir : '')}
                        cellRenderer={this._renderBar}
                    />
                    {statusColumns}
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

module.exports = DQAScores;
