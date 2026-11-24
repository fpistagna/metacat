#!/bin/sh

set -eu

keyfile=/data/configdb/keyfile

if [ ! -s "$keyfile" ]; then
  umask 077
  head -c 512 /dev/urandom | base64 | tr -d '\n' > "$keyfile"
fi

chown mongodb:mongodb "$keyfile"
chmod 400 "$keyfile"

exec /usr/local/bin/docker-entrypoint.sh mongod \
  --replSet rs0 \
  --bind_ip_all \
  --keyFile "$keyfile"
