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

For deployment, Docker and Compose must be installed.


```
docker-compose up -d
```
