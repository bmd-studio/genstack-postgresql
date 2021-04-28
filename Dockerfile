ARG DOCKER_BASE_IMAGE
FROM $DOCKER_BASE_IMAGE

# Request a specific commit to make sure things keep working
ENV WAL2JSON_COMMIT_ID=1527dfc56a54d5b7c15b2fb6ec2ab8d7776402ec

# Compile the wal2json plugin from sources and install it
RUN apk --update add --virtual build-dependencies build-base git openssh clang llvm \
  && git clone https://github.com/eulerto/wal2json -b master --single-branch \
  && cd /wal2json \
  && git checkout $WAL2JSON_COMMIT_ID \
  && USE_PGXS=1 make && USE_PGXS=1 make install \
  && cd / \
  && rm -rf wal2json \
  && apk del build-dependencies

COPY postgresql.conf /tmp/postgresql/postgresql.conf
RUN cat /tmp/postgresql/postgresql.conf >> /usr/local/share/postgresql/postgresql.conf.sample

WORKDIR /usr/local/bin/
COPY docker-healthcheck ./
RUN chmod +x ./docker-healthcheck
HEALTHCHECK CMD ["docker-healthcheck"]

CMD ["postgres", "-c", "config_file=/usr/local/share/postgresql/postgresql.conf.sample"]