ARG DOCKER_IMAGE
FROM $DOCKER_IMAGE

# Request a specific commit to make sure things keep working
ENV WAL2JSON_COMMIT_ID=da90c76a69966a7dfcf0657acacde916164bd9c0

# Compile the wal2json plugin from sources and install it
RUN apk --update add --virtual build-dependencies build-base git openssh \
  && git clone https://github.com/eulerto/wal2json -b master --single-branch \
  && cd /wal2json \
  && git checkout $WAL2JSON_COMMIT_ID \
  && USE_PGXS=1 make && USE_PGXS=1 make install \
  && cd / \
  && rm -rf wal2json \
  && apk del build-dependencies

COPY postgresql.conf /tmp/postgresql/postgresql.conf
RUN cat /tmp/postgresql/postgresql.conf >> /usr/local/share/postgresql/postgresql.conf.sample

COPY docker-healthcheck /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-healthcheck
HEALTHCHECK CMD ["docker-healthcheck"]

CMD ["postgres", "-c", "config_file=/usr/local/share/postgresql/postgresql.conf.sample"]