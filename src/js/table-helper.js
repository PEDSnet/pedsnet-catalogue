var updateWidth = function(table) {
    // there has to be a better way to size the table correctly, but this will do for now.
    // (TODO figure out a cleaner way to do this)
    var component = document.getElementById('tableContainer');
    if (component) {
        table.setState({
            tableWidth : component.clientWidth
        });
    }
};

var _onResize = function(table) {
    return function() {
        updateWidth(table);
	};
};

var addResizeListener = function(table) {
    if (window.addEventListener) {
      window.addEventListener('resize', _onResize(table), false);
    }
    else if (window.attachEvent) {
      window.attachEvent('onresize', _onResize(table));
    }
    else {
      window.onresize =  _onResize(table);
    }
};

var onColumnResizeEndCallback = function(table, isColumnResizing) {
    return function(newColumnWidth, dataKey) {
        var w = table.state.columnWidths;
        w[dataKey] = newColumnWidth;
        table.setState({
            columnWidths: w
        });

        isColumnResizing = false;
    };
};

var rowGetter = function(table) {
    return function (rowIndex) {
        return table.state.rows[rowIndex];
    };
};

var clickHandler = function(table) {
    return function() {
        table.setState({
            isCollapsed : !table.state.isCollapsed
        });
    };
};

var status = {
    'active': {
        sortOrder: -1,
        desc: 'Total number of issues with New, Under Review, and Solution Proposed status.'
    },

    'new': {
        sortOrder: 0,
        desc: 'The issue has been identified by the DCC but has not yet been reviewed by the site.'
    },
    'under review': {
        sortOrder: 1,
        desc: 'The site is currently investigating the issue.'
    },
    'solution proposed': {
        sortOrder: 2,
        desc: ('The site has investigated the issue, and ' +
               'a consensus about the solution has been reached; ' +
               'the site has agreed to fix the issue in the next data cycle(s).')
    },
    'default': {
        sortOrder: 10
    },
    'persistent': {
        sortOrder: 20,
        label: 'inherent',
        desc: ('The issue has been investigated, ' +
               'and it was concluded that it cannot be fixed ' +
               'due to the inherent characteristics of the data.')
    },
    // 'inherent' is actually just a label for 'persistent', but 
    // listing it here as well makes sorting simpler.
    'inherent': {
        sortOrder: 20,
        label: 'inherent',
        desc: ('The issue has been investigated, ' +
               'and it was concluded that it cannot be fixed ' +
               'due to the inherent characteristics of the data.')
    },
    'withdrawn': {
        sortOrder: 30,
        desc: 'False alarm.'
    },
    'non-issue': {
        sortOrder: 31,
        desc: 'False alarm.'
    },
    'closed': {
        sortOrder: 32,
        desc: ''
    }
};


module.exports = {
    addResizeListener: addResizeListener,
    clickHandler: clickHandler,
    onColumnResizeEndCallback: onColumnResizeEndCallback,
    rowGetter: rowGetter,
    statusList: status,
    updateWidth: updateWidth
};

