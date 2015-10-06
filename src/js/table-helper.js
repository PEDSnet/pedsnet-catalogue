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


module.exports = {
    addResizeListener: addResizeListener,
    clickHandler: clickHandler,
    onColumnResizeEndCallback: onColumnResizeEndCallback,
    rowGetter: rowGetter,
    updateWidth: updateWidth
};

