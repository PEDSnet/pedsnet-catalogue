var React = require('react'),
    _ = require('underscore');


// Renders an object that represents a data model element. The passed
// object has the format:
// - domain - The domain the object is defined in.
// - ident - The identity of the object within the domain.
// - label - A human-readable label.
// - doc - Documentation or description of the object.
// - time - Timestamp of the last change made to the object.
// - facts - Array of facts for this object.
// - attrs - Set of latest facts for each attribute.
var Entity = React.createClass({
    getDefaultProps: function() {
        return {
            database: '',
            entity: {},
        };
    },

    render: function() {
        var entity = this.props.entity,
            process, archive;

        var rows = [];

        _.each(entity.attrs, function(item) {
            if (item.attr === 'loadProcess') {
                process = item.value;
                return;
            }

            if (item.attr === 'dataArchive') {
                archive = item.value;
                return;
            }

            // Ignore other things.
            if (!/^pedsnet.cdm/.test(item.attr)) {
                return;
            }

            var date = new Date(item.time / 1000 / 1000);

            return (
                <tr key={item.ident} title={'Asserted on ' + date.toLocaleString()}>
                    <th>{item.attr}</th>
                    <td>{item.value}</td>
                </tr>
            );
        });

        var path = router.reverse(entity.domain, entity.ident);
            permalink = router.permalink(path);

        return (
            <div>
                <h4>{entity.label || entity.ident}</h4>

                <ul className="list-inline">
                    <li><i className="fa fa-link" /> <a href={permalink}>{permalink}</a></li>
                    <li><i className="fa fa-database" /> {this.props.database}</li>
                    <li><i className="fa fa-file-archive-o" /> {archive}</li>
                    <li><i className="fa fa-cogs" /> {process}</li>
                </ul>

                <p className="text-muted">{entity.doc}</p>

                <table className="table table-condensed">
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
});


module.exports = Entity;
