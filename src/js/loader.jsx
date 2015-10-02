var React = require('react');


var Loader = React.createClass({
    render: function() {
        return (
            <span className='is-loading'>
                <i className='fa fa-spinner fa-spin' />
            </span>
        );
    }
});


module.exports = Loader;
