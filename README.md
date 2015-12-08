# pedsnet-catalogue

The PEDSnet catalogue provides information about the various resources being used in the PEDSnet, how they are related, and how they ultimately influence the data provided by the DCC.

The catalogue focuses:

- ETL
    - List of data archives that have been processed by the DCC and their state
    - List of databases that are available
- Data
    - Individual records of data and their lineage
- Data models
    - List of data models that are being used or targeted in PEDSnet


## Development

Install Grunt and dependencies.

```
npm install grunt -g
npm install
```

Run the `work` task to watch and rebuild changed files.

```
grunt work
```

Run the `serve` task to serve up the files.

```
grunt serve
```

Open the browser to `localhost:8125`.

## Deploy

For deployment, Docker must be used. Define an environment file with the following service URLs  and the 
application base path specified. 
The URLs and the base path will be dynamically added to the `index.html` file.

```
# services.env
PEDSNET_ETL_URL=http://example.com:6001/
PEDSNET_DDL_URL=http://example.com:6006/
PEDSNET_DATAMODELS_URL=http://example.com:6003/models/
PEDSNET_DQA_URL=http://example.com:6005/
PEDSNET_DATADICT_URL=http://example.com:6002/
PEDSNET_ROOT=/catalogue
```

Run the container:

```
docker run --name=pedsnet-catalogue --env-file=services.env -p 80:80 -d pedsnet/catalogue
```

## Docker

### Push Image to Docker Registry

This requires you to be authenticated with the Docker Registry (one time) and authorized to push images.

```
grunt dist
docker build -t pedsnet/catalogue .
docker push pedsnet/catalogue
```
