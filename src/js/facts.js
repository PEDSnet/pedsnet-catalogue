var _ = require('underscore');

// Aggregates a set of facts by entity. The Origins label and doc are picked
// out of the attributes. A separate index of facts are maintained for the
// unique set of attributes for the entity.
var aggregate = function(facts) {
    var idx,
        pair,
        ident,
        entity,
        attr,
        value,
        attrmap,
        index = {},
        entities = [];

    // Aggregate facts by identity. The result are objects with the most recent
    // facts for each attribute.
    _.each(facts, function(fact) {
        ident = fact.Entity.Local;
        entity = index[ident];

        if (!entity) {
            // Map of attribute name to the index in the attrs array.
            attrmap = {};

            entity = index[ident] = {
                ident: ident,
                domain: fact.Entity.Domain || fact.Domain,
                facts: [],
                attrs: []
            };

            entities.push(entity);
        }

        entity.time = fact.Time;
        entity.facts.push(fact);

        if (!fact.Attribute.Domain || fact.Attribute.Domain === fact.Domain) {
            attr = fact.Attribute.Local;
        } else {
            attr = fact.Attribute.Domain + ':' + fact.Attribute.Local;
        }

        if (fact.Attribute.Domain === 'origins') {
            switch (fact.Attribute.Local) {
                case 'attr/label':
                    entity.label = fact.Value.Local;
                    break;
                case 'attr/doc':
                    entity.doc = fact.Value.Local;
                    break;
                default:
                    console.warn('Unexpected Origins attribute: ' + fact.Attribute.Local);
            }
        } else {
            if (!fact.Value.Domain || fact.Value.Domain === fact.Domain) {
                value = fact.Value.Local;
            } else {
                value = fact.Value.Domain + ':' + fact.Value.Local;
            }

            idx = attrmap[attr];

            pair = {
                attr: attr,
                value: value,
                time: fact.Time,
            };

            if (idx === undefined) {
                idx = entity.attrs.push(pair);
                attrmap[attr] = idx - 1;
            } else {
                entity.attrs[idx] = pair;
            }
        }
    });

    _.sortBy(entities, function(item) {
        return item.label;
    });

    // Attach index to entities array for ident-based lookups.
    entities.index = index;

    return entities;
};


module.exports = {
    aggregate: aggregate
};
