var React = require('react'),
    _ = require('underscore');

var FixedDataTable = require('fixed-data-table'),
    Column = FixedDataTable.Column,
    Table = FixedDataTable.Table;

var Helper = require('./table-helper');

var isColumnResizing;
var width = 80;

var SortTypes = {
    ASC: 'ASC',
    DESC: 'DESC'
};
        
var DQA = React.createClass({
    propTypes: {
        aggregated: React.PropTypes.bool,
        data: React.PropTypes.object,
        dict: React.PropTypes.object
    },

    getDefaultProps: function() {
        return {
            aggregated: false,
            data: {},
            dict: {}
        };
    },

    getInitialState: function() {
        return {
            columnWidths: {
                code: width,
                desc: 3*width,
                status: 2*width,
                sites: 3*width,
            },
            isCollapsed: false,
            rows: {},
            sortBy: 'code',
            sortDir: SortTypes.ASC,
            tableWidth: 500
        };
    },

    _getRows: function(props, sortBy) {
        var code;
        var desc;
        var rows = [];
        var status;
        var sites;

        if (!sortBy) {
            sortBy = this.state.sortBy;
        }

        for (code in props.data) {
            desc = props.dict[code]? props.dict[code].desc : '';

            for (status in props.data[code]) {
                if (this.props.aggregated) {
                    sites = [];
                    for (site in props.data[code][status]) {
                        sites.push(site + '(' + props.data[code][status][site].length + ')');
                    }
                }
                else {
                    sites = props.data[code][status].map(function(obj) {
                        return obj.site;
                    });
                }

                // if the table is sorted by site, list sites individually;
                // if the table is sorted by anything other than site, 
                // keep sites grouped by (code + status)
                if (sortBy === 'sites') {
                    sites.forEach(function(site) {
                        rows.push({
                            code: code,
                            desc: desc,
                            status: status,
                            sites: site
                        });
                    });
                }
                else {
                    sites = sites.reduce(function(a,b) {
                        return a + ', ' + b;
                    });

                    rows.push({
                        code: code,
                        desc: desc,
                        status: status,
                        sites: sites
                    });
                }
            }
        }
        return rows;
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            rows: this._getRows(nextProps)
        })
    },

    componentWillMount: function() {
        this.setState({
            rows: this._getRows(this.props)
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

    _renderHeader: function(label, cellDataKey) {
        return (
          <a onClick={this._sortRowsBy.bind(null, cellDataKey)}>{label}</a>
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
                    width={this.state.columnWidths['code']}
                    isResizable={true}
                    dataKey={'code'}
                    fixed={true}
                    headerRenderer={this._renderHeader}
                    label={'Code' + (this.state.sortBy === 'code' ? sortDirArrow : '')}
                />
                <Column
                    width={this.state.columnWidths['desc']}
                    isResizable={true}
                    dataKey={'desc'}
                    headerRenderer={this._renderHeader}
                    label={'Description' + (this.state.sortBy === 'desc' ? sortDirArrow : '')}
                />
                <Column
                    width={this.state.columnWidths['status']}
                    isResizable={true}
                    dataKey={'status'}
                    headerRenderer={this._renderHeader}
                    label={'Status' + (this.state.sortBy === 'status' ? sortDirArrow : '')}
                />
                <Column
                    width={this.state.columnWidths['sites']}
                    isResizable={true}
                    dataKey={'sites'}
                    headerRenderer={this._renderHeader}
                    label={'Sites' + (this.state.sortBy === 'sites' ? sortDirArrow : '')}
                />              
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

module.exports = DQA;
