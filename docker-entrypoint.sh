#!/bin/sh
set -e

# Fix ownership of data directory if it's not correct
if [ "$(id -u)" = "0" ]; then
    chown -R node:node /app/data
    exec su-exec node "$@"
else
    exec "$@"
fi
