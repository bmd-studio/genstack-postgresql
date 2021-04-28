import { assignIn, join, map, range } from 'lodash';
import pg, { Pool } from 'pg';
import { GenericContainer, Network, StartedNetwork, StartedTestContainer } from 'testcontainers';

const POSTGRES_INTERNAL_PORT = 5432;

const POSTGRES_DOCKER_IMAGE = 'ghcr.io/bmd-studio/genstack-postgresql:latest';

const POSTGRES_HOST_NAME = 'localhost';
const POSTGRES_DATABASE_NAME = 'test';
const POSTGRES_SUPER_USER_ROLE_NAME = 'postgres';
const POSTGRES_SUPER_USER_SECRET = 'password';
const POSTGRES_PGDATA_PATH = '/var/lib/postgresql/data/pgdata';
export const POSTGRES_PUBLIC_SCHEMA_NAME = 'app_public';

export const PROJECT_AMOUNT = 10000;
export const PROJECT_TABLE_NAME = 'projects';
export const DEFAULT_PROJECT_NAME = 'Test Project';
export const DEFAULT_PROJECT_POSITION = 10;

let network: StartedNetwork;
let pgContainer: StartedTestContainer; 

const setupTestContainer = async(): Promise<void> => {
  network = await new Network()
    .start();

  pgContainer = await new GenericContainer(POSTGRES_DOCKER_IMAGE)
    .withNetworkMode(network.getName())
    .withExposedPorts(POSTGRES_INTERNAL_PORT)
    .withEnv('POSTGRES_USER', POSTGRES_SUPER_USER_ROLE_NAME)
    .withEnv('POSTGRES_PASSWORD', POSTGRES_SUPER_USER_SECRET)
    .withEnv('POSTGRES_DB', POSTGRES_DATABASE_NAME)
    .withEnv('PGDATA', POSTGRES_PGDATA_PATH)
    .start();
};

const shutdownContainers = async(): Promise<void> => {
  await pgContainer?.stop();
};

const setupEnv = async (): Promise<void> => {
  assignIn(process.env, {
    POSTGRES_PORT: pgContainer?.getMappedPort(POSTGRES_INTERNAL_PORT),
  });
};

export const getPgPool = async(): Promise<pg.Pool> => {
  const { POSTGRES_PORT } = process.env;
  const pool = new Pool({
    host: POSTGRES_HOST_NAME,
    port: POSTGRES_PORT,
    user: POSTGRES_SUPER_USER_ROLE_NAME,
    password: POSTGRES_SUPER_USER_SECRET,
    database: POSTGRES_DATABASE_NAME,
  });

  return pool;
};

const setupDatabase = async (): Promise<void> => {
  const pgPool = await getPgPool();

  await pgPool.query(`
    CREATE EXTENSION "uuid-ossp";

    CREATE SCHEMA "${POSTGRES_PUBLIC_SCHEMA_NAME}";

    CREATE TABLE "${POSTGRES_PUBLIC_SCHEMA_NAME}"."${PROJECT_TABLE_NAME}" (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      position integer,
      name text
    );
    CREATE INDEX position_index ON "${POSTGRES_PUBLIC_SCHEMA_NAME}"."${PROJECT_TABLE_NAME}" (position);
    CREATE INDEX name_index ON "${POSTGRES_PUBLIC_SCHEMA_NAME}"."${PROJECT_TABLE_NAME}" (name);
  `);
  const values = join(map(range(0, PROJECT_AMOUNT), () => {
    return `($1, $2)`;
  }), ',');

  await pgPool.query(`
    INSERT INTO "${POSTGRES_PUBLIC_SCHEMA_NAME}"."${PROJECT_TABLE_NAME}" (name, position)
    VALUES ${values};
  `, [DEFAULT_PROJECT_NAME, DEFAULT_PROJECT_POSITION]);
};

export const setupTestApp = async (): Promise<void> => {
  await setupTestContainer();
  await setupEnv();
  await setupDatabase();
};

export const shutdownTestApp = async (): Promise<void> => {
  await shutdownContainers();
};