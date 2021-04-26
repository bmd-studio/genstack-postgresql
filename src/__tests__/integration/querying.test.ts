import { setupTestApp, shutdownTestApp, PROJECT_AMOUNT, DEFAULT_PROJECT_POSITION, getPgPool, PROJECT_TABLE_NAME, POSTGRES_PUBLIC_SCHEMA_NAME } from '../setup/app';

describe('querying', () => {
  beforeAll(async () => {
    await setupTestApp();
  });
  afterAll(async () => {
    await shutdownTestApp();
  });

  it('should query projects', async () => {
    const pgPool = await getPgPool();
    const projects = await pgPool.query(`
      SELECT * FROM "${POSTGRES_PUBLIC_SCHEMA_NAME}"."${PROJECT_TABLE_NAME}";
    `);

    expect(projects?.rows).toHaveLength(PROJECT_AMOUNT);
  });
});