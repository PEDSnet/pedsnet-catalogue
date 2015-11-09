var React = require('react'),
    _ = require('underscore');

var FixedDataTable = require('fixed-data-table'),
    Column = FixedDataTable.Column,
    Table = FixedDataTable.Table;

var Helper = require('./table-helper');

var isColumnResizing;

var SortTypes = {
    ASC: 'ASC',
    DESC: 'DESC'
};

var Status = {
    'new': {
        sortOrder: 0,
        desc: 'The issue has been identified by the Data Coordinating Center.',
    },
    'under review': {
        sortOrder: 1,
        desc: 'The site has acknowledged that it needs to investigate the issue.',
    },
    'solution proposed': {
        sortOrder: 2,
        desc: ('The site has investigated the issue, and ' +
               'a consensus about the solution has been reached; ' +
               'the site has agreed to fix the issue in the next round.'),
    },
    'default': {
        sortOrder: 10,
    },
    'persistent': {
        sortOrder: 20,
        label: 'inherent',
        desc: ('The issue has been investigated, ' +
               'and it was concluded that it cannot be fixed.'),
    },
    'withdrawn': {
        sortOrder: 30,
        desc: 'False alarm.  An investigation has concluded this to be a non-issue.',
    },
    'non-issue': {
        sortOrder: 31,
        desc: 'False alarm.  An investigation has concluded this to be a non-issue.',
    },
    'closed': {
        sortOrder: 32,
        desc: '',
    }
};
        
var DQAScores = React.createClass({
    propTypes: {
        columnWidth: React.PropTypes.number,
        data: React.PropTypes.object
    },

    getDefaultProps: function() {
        return {
            columnWidth: 130,
            data: {}
        };
    },

    getInitialState: function() {
        return {
            columnWidths: {},
            isCollapsed: false,
            rows: {},
            sortBy: null,
            sortDir: null,
            statusList: [],
            tableWidth: 500
        };
    },

    _initRows: function(props) {
        var row;
        var rows = [];
        var score;
        var site;
        
        // all sites have the same status list, so grab the list from 
        // any of the available sites.
        var anySiteData = props.data[Object.keys(props.data)[0]];
        var statusList = Object.keys(anySiteData);
        var statusWeights = {};
        
        statusList.forEach(function(status) {
            statusWeights[status] = 1;
        });

        statusWeights['persistent'] = 0;
        statusWeights['withdrawn'] = 0;
        statusWeights['non-issue'] = 0;
        statusWeights['closed'] = 0;

        for (site in props.data) {
            row = _.clone(props.data[site]);

            score = 0;
            for (var key in row) {
                score += row[key] * statusWeights[key];
            }
            row.score = score;
            row.site = site;

            rows.push(row);
        }

        // initial sort is by score, in descending order
        var sortBy = 'score';
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
    
        return rows;
    },

    _sortRowsBy: function(sortBy) {
        var sortDir = this.state.sortDir;

        // if we are sorting by the same column as we sorted last time,
        // reverse the sort order;
        // otherwise pick the default order (ascending for site names,
        // descending for scores).
        if (sortBy === this.state.sortBy) {
            sortDir = this.state.sortDir === SortTypes.ASC ? SortTypes.DESC : SortTypes.ASC;
        }
        else {
            if (sortBy === 'site') {
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
        var statusList = Object.keys(anySiteData);
        var w = props.columnWidth;

        var columnWidths = {
            site: w,
            score: w
        };

        statusList.forEach(function(status) {
            columnWidths[status] = w;
        });

        var rows = this._initRows(props);

        return {
            columnWidths: columnWidths,
            rows: rows,
            sortBy: 'score',
            sortDir: SortTypes.DESC,
            statusList: statusList
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
        if (Status[cellDataKey]) {
            tooltip_text = Status[cellDataKey].desc;
        }

        return (
          <a onClick={this._sortRowsBy.bind(null, cellDataKey)} data-toggle='tooltip' title={tooltip_text}>{label}</a>
        );
    },

    render: function() {
        var colWidth = this.props.columnWidth;
        var rowHeight = 30;
        var headerHeight = 50;
        var numRows = this.state.rows.length || 0;
        
        var sortDirArrow = '';
    
        if (this.state.sortDir !== null){
          sortDirArrow = this.state.sortDir === SortTypes.ASC ? (' ' + String.fromCharCode(9660)) : 
                                                                (' ' + String.fromCharCode(9650));
        }

        // columns should be displayed in the order specified by Status[]
        var statusList = _.clone(this.state.statusList).sort(function (a, b) {
            // for columns that don't have a sort order defined, we'll pick the
            // default order that will places them just before the non-issue column(s).
            // This is so that we don't ignore any new status that may get introduced
            // into the reports; this will also let us catch any potential misspellings.
            if (!(a in Status)) {
                a = 'default';
            }
            if (!(b in Status)) {
                b = 'default';
            }
            if (Status[a].sortOrder > Status[b].sortOrder) { 
                return 1;
            }
            else if (Status[a].sortOrder < Status[b].sortOrder) {
                return -1;
            }
            return 0;
        });

        var statusColumns = _.map(statusList, function(status) {
            var label = (Status[status] && Status[status].label) || status;

            return (
                <Column
                    key={status}
                    width={this.state.columnWidths[status] || colWidth}
                    isResizable={true}
                    dataKey={status}
                    headerRenderer={this._renderHeader}
                    label={label + (this.state.sortBy === status ? sortDirArrow : '')}
                />
            );
        }.bind(this));

        var contents = this.state.isCollapsed ? null:
            <Table
                rowHeight={rowHeight}
                rowGetter={Helper.rowGetter(this)}
                rowsCount={numRows}
                width={this.state.tableWidth}
                height={headerHeight + Math.min(11,numRows+0.5)*rowHeight + 2}
                headerHeight={headerHeight}
                overflowX='auto'
                overflowY='auto'
                isColumnResizing={isColumnResizing}
                onColumnResizeEndCallback={Helper.onColumnResizeEndCallback(this, isColumnResizing)}
                >
                <Column
                    width={this.state.columnWidths['site'] || colWidth}
                    isResizable={true}
                    dataKey={'site'}
                    fixed={true}
                    headerRenderer={this._renderHeader}
                    label={'site' + (this.state.sortBy === 'site' ? sortDirArrow : '')}
                />
                <Column
                    width={this.state.columnWidths['score'] || colWidth}
                    isResizable={true}
                    dataKey={'score'}
                    headerRenderer={this._renderHeader}
                    label={'active issues' + (this.state.sortBy === 'score' ? sortDirArrow : '')}
                />
                {statusColumns}
            </Table>
        
        return (
            <div className='panel-group dqa'>
                <div id='tableContainer' className='panel panel-default'>
                    <div className='panel-heading' onClick={Helper.clickHandler(this)}>
                        <h4 className='panel-title'>
                            <span className = {this.state.isCollapsed ? 'collapsed' : ''}>Data Quality</span>
                        </h4>
                    </div>
                    {contents}
                </div>
            </div>
        );
    }
});

module.exports = DQAScores;
