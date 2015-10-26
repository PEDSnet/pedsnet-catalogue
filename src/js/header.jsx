var React = require('react');


var Header = React.createClass({
    render: function() {            
        return (
            <header>
                <div className='header-row'>
                    <a className='brand' tabIndex={-1} href='/'><img src='/img/brand.png' /> PEDSnet Catalogue</a>
                </div>
            </header>
        );
    }
});

module.exports = Header;
