#!/bin/sh

if [ -n "${DISABLE_SENDFILE-}" ]; then
    sed -i "s|sendfile\([[:space:]]*\)on|sendfile\1off|g" /etc/nginx/nginx.conf
fi


sed -i "s|dataDict: ''|dataDict: '$PEDSNET_DATADICT_URL'|g" /usr/share/nginx/html/index.html
sed -i "s|ddl: ''|ddl: '$PEDSNET_DDL_URL'|g" /usr/share/nginx/html/index.html
sed -i "s|dataModel: ''|dataModel: '$PEDSNET_DATAMODELS_URL'|g" /usr/share/nginx/html/index.html
sed -i "s|dqa: ''|dqa: '$PEDSNET_DQA_URL'|g" /usr/share/nginx/html/index.html
sed -i "s|etl: ''|etl: '$PEDSNET_ETL_URL'|g" /usr/share/nginx/html/index.html
sed -i "s|root: ''|root: '$PEDSNET_ROOT'|g" /usr/share/nginx/html/index.html

$@
