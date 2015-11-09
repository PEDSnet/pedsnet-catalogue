#!/bin/sh

if [ -n "${DISABLE_SENDFILE-}" ]; then
    sed -i "s|sendfile\([[:space:]]*\)on|sendfile\1off|g" /etc/nginx/nginx.conf
fi

$@
