// Hard-coded URLs to resources of interest.
// TODO: this could be driven by a separate domain.
module.exports = {
    etl: origins.endpoint + '/domains/pedsnet.dcc.loader/facts',
    warehouse: origins.endpoint + '/domains/pedsnet.dcc.warehouse/facts',
    pcornet: origins.endpoint + '/domains/pcornet.cdm/facts',
    pedsnet: origins.endpoint + '/domains/pedsnet.cdm/facts',
    i2b2: origins.endpoint + '/domains/i2b2.data/facts'
};
