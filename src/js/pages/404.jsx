var React = require('react');

var Page = require('./page');


module.exports = React.createClass({
    render: function() {
        return (
            <Page>
                <div className='row'>
                    <div className='col-md-6 col-md-offset-3'>
                        <div className='page-header text-centered'>
                            <h3>:( What are you looking for?</h3>

                            <p>The resource you requested does not exist.</p>
                        </div>
                    </div>
                </div>
            </Page>
        );
    }
});
