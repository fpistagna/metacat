'use strict';

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/v1/database/modular/mongoose');

const TEST_DATABASE_NAME_PATTERN = /(^|[-_])test$/i;

function getDatabaseName(databaseUrl) {
  const schemeMatch = databaseUrl.match(/^mongodb(?:\+srv)?:\/\//i);
  if (!schemeMatch) {
    throw new Error('TEST_DATABASE_URL must use the mongodb or mongodb+srv protocol.');
  }

  const pathStart = databaseUrl.indexOf('/', schemeMatch[0].length);
  const rawDatabaseName = pathStart === -1
    ? ''
    : databaseUrl.slice(pathStart + 1).split(/[?#]/, 1)[0];
  const databaseName = decodeURIComponent(rawDatabaseName);

  if (!databaseName) {
    throw new Error('TEST_DATABASE_URL must include an explicit database name.');
  }

  return databaseName;
}

function getTestDatabaseUrl() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Database test helpers can only run with NODE_ENV=test.');
  }

  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('TEST_DATABASE_URL is required for tests that use MongoDB.');
  }

  const databaseName = getDatabaseName(databaseUrl);
  if (!TEST_DATABASE_NAME_PATTERN.test(databaseName)) {
    throw new Error(
      `Refusing to use database '${databaseName}': its name must end in 'test', '_test', or '-test'.`
    );
  }

  return databaseUrl;
}

async function connectTestDB() {
  const databaseUrl = getTestDatabaseUrl();
  const expectedDatabaseName = getDatabaseName(databaseUrl);

  await connectDB(databaseUrl, { serverSelectionTimeoutMS: 5000 });

  if (mongoose.connection.name !== expectedDatabaseName) {
    const actualDatabaseName = mongoose.connection.name;
    await disconnectDB();
    throw new Error(
      `Connected to unexpected database '${actualDatabaseName}', expected '${expectedDatabaseName}'.`
    );
  }

  return mongoose.connection;
}

function getMigrationTestEnvironment() {
  const databaseUrl = getTestDatabaseUrl();
  return {
    ...process.env,
    NODE_ENV: 'test',
    DATABASE_URL: databaseUrl
  };
}

module.exports = {
  connectTestDB,
  disconnectTestDB: disconnectDB,
  getMigrationTestEnvironment,
  getTestDatabaseUrl
};
