var React = require('react');

var Page = require('./page'),
    Loader = require('../loader'),
    FactLog = require('../fact-log'),
    Comparators = require('../comparators');


// Dashboard contains a recent snapshot of information.
// Required properties:
// - etlActivity
// - dataActivity
var Dashboard = React.createClass({
    propTypes: {
        etlActivity: React.PropTypes.array,
        dataActivity: React.PropTypes.array
    },

    render: function() {
        var etlActivity = this.props.etlActivity,
            dataActivity = this.props.dataActivity;

        if (!etlActivity) {
            etlActivity = <Loader />;
        } else if (etlActivity.length === 0) {
            etlActivity = <span className="is-empty">No new activity.</span>;
        }

        if (!dataActivity) {
            dataActivity = <Loader />;
        } else if (dataActivity.length === 0) {
            dataActivity = <span className="is-empty">No new data.</span>;
        }

        return (
            <Page>
                <div className="row">
                    <div className="col-md-6">
                        <div className="page-header">
                            <h3><i className="fa fa-gears" /> ETL Activity</h3>

                            <p>Feed of activity in the ETL pipeline.</p>
                        </div>

                        <FactLog facts={etlActivity}
                            comparator={Comparators.entityTime}
                        />
                    </div>

                    <div className="col-md-6">
                        <div className="page-header">
                            <h3><i className="fa fa-database" /> Data Activity</h3>

                            <p>Feed of data that has been recently added or updated.</p>
                        </div>

                        <FactLog facts={dataActivity}
                            comparator={Comparators.entityTime}
                        />
                    </div>
                </div>
            </Page>
        );
    }
});

module.exports = Dashboard;
