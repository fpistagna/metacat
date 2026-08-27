'use strict';

const { expect } = require('chai');
const {
  getMigrationTestEnvironment,
  getTestDatabaseUrl
} = require('./helpers/testDatabase');

describe('Test database safety guard', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalTestDatabaseUrl = process.env.TEST_DATABASE_URL;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;
    delete process.env.TEST_DATABASE_URL;
  });

  after(() => {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;

    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;

    if (originalTestDatabaseUrl === undefined) delete process.env.TEST_DATABASE_URL;
    else process.env.TEST_DATABASE_URL = originalTestDatabaseUrl;
  });

  it('rejects execution outside the test environment', () => {
    process.env.NODE_ENV = 'development';
    process.env.TEST_DATABASE_URL = 'mongodb://127.0.0.1:27017/metacat_test';

    expect(() => getTestDatabaseUrl()).to.throw('NODE_ENV=test');
  });

  it('requires an explicit test database URL', () => {
    expect(() => getTestDatabaseUrl()).to.throw('TEST_DATABASE_URL is required');
  });

  it('rejects a database whose name is not explicitly a test database', () => {
    process.env.TEST_DATABASE_URL = 'mongodb://127.0.0.1:27017/metacat';

    expect(() => getTestDatabaseUrl()).to.throw("Refusing to use database 'metacat'");
  });

  it('accepts a database name ending in a standalone test segment', () => {
    const testDatabaseUrl = 'mongodb://127.0.0.1:27017/metacat_test';
    process.env.TEST_DATABASE_URL = testDatabaseUrl;

    expect(getTestDatabaseUrl()).to.equal(testDatabaseUrl);
  });

  it('accepts a safe database in a replica set connection URL', () => {
    const testDatabaseUrl =
      'mongodb://db1:27017,db2:27017/metacat_test?replicaSet=rs0';
    process.env.TEST_DATABASE_URL = testDatabaseUrl;

    expect(getTestDatabaseUrl()).to.equal(testDatabaseUrl);
  });

  it('forces migration subprocesses to use the isolated test database', () => {
    const testDatabaseUrl = 'mongodb://127.0.0.1:27017/metacat_test';
    process.env.DATABASE_URL = 'mongodb://127.0.0.1:27017/metacat';
    process.env.TEST_DATABASE_URL = testDatabaseUrl;

    const migrationEnvironment = getMigrationTestEnvironment();

    expect(migrationEnvironment.NODE_ENV).to.equal('test');
    expect(migrationEnvironment.DATABASE_URL).to.equal(testDatabaseUrl);
  });
});
