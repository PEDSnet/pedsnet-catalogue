var React = require('react'),
    _ = require('underscore');

var FixedDataTable = require('fixed-data-table'),
    Column = FixedDataTable.Column,
    Table = FixedDataTable.Table;

var isColumnResizing;
var width = 70;
var columnWidths = {
    code: width,
    desc: 3*width,
    status: 2*width,
    num: width,
};

var SortTypes = {
    ASC: 'ASC',
    DESC: 'DESC',
};
        
var DQA = React.createClass({
    propTypes: {
        content: React.PropTypes.string,
        width: React.PropTypes.number,
        data: React.PropTypes.object,
    },

    getDefaultProps: function() {
        return {
            content: '',
            width: 500,
            data: {},
        };
    },

    getInitialState: function() {
        return {
            isCollapsed: false,
            rows: this._getRows(),
            sortBy: null,
            sortDir: null,
        };
    },

    _getRows: function() {
        var code;
        var rows = [];
        var status;
        var numSites;

        for(code in this.props.data) {
            for(status in this.props.data[code]) {
                numSites = this.props.data[code][status].length;
                rows.push([code, '', status, numSites]);
            }
        }
        return rows;
    },

    componentDidMount: function() {
        this._sortRowsBy(0);
    },

    _onColumnResizeEndCallback: function(newColumnWidth, dataKey) {
        columnWidths[dataKey] = newColumnWidth;
        isColumnResizing = false;
        this.forceUpdate(); // don't do this, use a store and put into this.state! TODO
    },

    _sortRowsBy: function(cellDataKey) {
        var sortDir = this.state.sortDir;
        var sortBy = cellDataKey;

        if (sortBy === this.state.sortBy) {
          sortDir = this.state.sortDir === SortTypes.ASC ? SortTypes.DESC : SortTypes.ASC;
        } else {
          sortDir = SortTypes.DESC;
        }
        
        var rows = this.state.rows.slice();
        rows.sort(function(a, b) {
        var sortVal = 0;

        /*
        if (sortBy === 0) {
            var validValues = ['high', 'medium', 'low'];

            if (validValues.indexOf(a[sortBy])<0 && validValues.indexOf(b[sortBy])<0) {
                // if we got unexpected values, sort them alphabetically
                if (a[sortBy] > b[sortBy]) {
                    sortVal = 1;
                }
                if (a[sortBy] < b[sortBy]) {
                    sortVal = -1;
                }
            } else if (validValues.indexOf(a[sortBy])<0) {
                // a valid value is greater than an invalid one
                sortVal = -1;
            } else if (validValues.indexOf(b[sortBy])<0) {
                // a valid value is greater than an invalid one
                sortVal = 1;
            } else if (a[sortBy] === b[sortBy]) {
                sortVal = 0;
            } else if (a[sortBy] === 'high') {
                sortVal = 1;
            } else if (b[sortBy] === 'high') {
                sortVal = -1;
            } else if (a[sortBy] === 'medium') {
                sortVal = 1;
            } else if (b[sortBy] === 'medium') {
                sortVal = -1;
            }
        } else {
            if (a[sortBy] > b[sortBy]) {
                sortVal = 1;
            }
            if (a[sortBy] < b[sortBy]) {
                sortVal = -1;
            }
        }
        */

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
          rows:rows,
          sortBy: sortBy,
          sortDir: sortDir,
        });
    },    

    _renderHeader: function(label, cellDataKey) {
        return (
          <a onClick={this._sortRowsBy.bind(null, cellDataKey)}>{label}</a>
        );
    },

    _rowGetter: function (rowIndex) {
        return this.state.rows[rowIndex];
    },

    render: function() {
        var rowHeight = 30;
        var headerHeight = 50;
        var numRows = this.state.rows.length;
        
        var sortDirArrow = '';
    
        if (this.state.sortDir !== null){
          sortDirArrow = this.state.sortDir === SortTypes.DESC ? ' ↓' : ' ↑';
        }

        var contents = this.state.isCollapsed ? null:
            <Table
                rowHeight={rowHeight}
                rowGetter={this._rowGetter}
                rowsCount={numRows}
                width={this.props.width}
                height={headerHeight + Math.min(11,numRows+0.5)*rowHeight + 2}
                headerHeight={headerHeight}
                overflowX='auto'
                overflowY='auto'
                isColumnResizing={isColumnResizing}
                onColumnResizeEndCallback={this._onColumnResizeEndCallback}
                >

                <Column
                    width={columnWidths['code']}
                    isResizable={true}
                    dataKey={0}
                    headerRenderer={this._renderHeader}
                    label={'Code' + (this.state.sortBy === 0 ? sortDirArrow : '')}
               />
                <Column
                    width={columnWidths['desc']}
                    isResizable={true}
                    dataKey={1}
                    headerRenderer={this._renderHeader}
                    label={'Description' + (this.state.sortBy === 1 ? sortDirArrow : '')}
                />
                <Column
                    width={columnWidths['status']}
                    isResizable={true}
                    dataKey={2}
                    headerRenderer={this._renderHeader}
                    label={'Status' + (this.state.sortBy === 2 ? sortDirArrow : '')}
                />
                <Column
                    width={columnWidths['num']}
                    isResizable={true}
                    dataKey={3}
                    headerRenderer={this._renderHeader}
                    label={'# sites' + (this.state.sortBy === 3 ? sortDirArrow : '')}
                />              
            </Table>
        
        return (
            <div className='panel-group dqa'>
                <div id='dqaContainer' className='panel panel-default'>
                    <div className='panel-heading' onClick={this.handleClick}>
                        <h4 className='panel-title'>
                            <span className = {this.state.isCollapsed ? 'collapsed' : ''}>Data Quality</span>
                        </h4>
                    </div>
                    {contents}
                </div>
            </div>
        );
    },

    handleClick: function() {
        this.setState({
            isCollapsed : !this.state.isCollapsed
        });
    },
});


module.exports = DQA;
