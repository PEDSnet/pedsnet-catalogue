var React = require('react');


var Page = React.createClass({
    render: function() {
        return (
            <div className='container-fluid fixed-height'>
                <div className='row fixed-height'>
                    <div className='col-md-11 col-md-offset-05 fixed-height'>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
});


module.exports = Page;
