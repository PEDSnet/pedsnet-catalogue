var React = require('react');


var Page = React.createClass({
    render: function() {
        return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-11 col-md-offset-05'>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
});


module.exports = Page;
