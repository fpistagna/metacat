#!/bin/sh

set -eu

run_mongosh() {
  mongosh --quiet \
    --host mongodb \
    --port 27017 \
    --username "$MONGO_USER" \
    --password "$MONGO_PASS" \
    --authenticationDatabase admin \
    "$@"
}

run_mongosh --eval '
  try {
    rs.status()
  } catch (error) {
    if (error.code === 94 || error.codeName === "NotYetInitialized") {
      rs.initiate({
        _id: "rs0",
        members: [{ _id: 0, host: "mongodb:27017" }]
      })
    } else {
      throw error
    }
  }
'

until [ "$(run_mongosh --eval 'db.hello().isWritablePrimary')" = "true" ]; do
  sleep 1
done
