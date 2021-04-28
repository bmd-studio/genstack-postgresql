#!/bin/sh  

# check for custom name env variables that we should forward to the internal postgres ones
export POSTGRES_USER=${POSTGRES_SUPER_USER_ROLE_NAME:-$POSTGRES_USER}
export POSTGRES_PASSWORD=${POSTGRES_SUPER_USER_SECRET:-$POSTGRES_PASSWORD}
export POSTGRES_DB=${POSTGRES_DEFAULT_DATABASE_NAME:-$POSTGRES_DB}
export PGDATA=${POSTGRES_PGDATA_PATH:-$PGDATA}