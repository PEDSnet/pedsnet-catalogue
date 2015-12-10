var React = require('react');

var root = require('./env').root;

var Header = React.createClass({
    render: function() {            
        return (
            <header>
                <div className='header-row'>
                    <a className='brand' tabIndex={-1} href={root}><img src={root+'/img/brand.png'} /> PEDSnet Catalogue</a>
                </div>
            </header>
        );
    }
});

module.exports = Header;
