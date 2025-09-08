// scripts/migrate.js
'use strict';

require('dotenv').config();

const { Umzug, MongoDBStorage } = require('umzug');
const mongoose = require('mongoose');
const { connectDB } = require('../src/v1/database/modular/mongoose');

const umzug = new Umzug({
  migrations: { glob: 'migrations/*.js' },
  // Mongoose connection is passed as context for every migration 
  context: mongoose.connection,
  storage: new MongoDBStorage({
    connection: mongoose.connection,
    collectionName: 'migrations_changelog',
  }),

  logger: console,
});

const run = async () => {
  await connectDB();

  // command passed by terminal (eg. 'up', 'down', 'create')
  const cmd = process.argv[2] ? process.argv[2].trim() : null;
  const migrationName = process.argv[3] ? process.argv[3].trim() : null;
  
  switch (cmd) {
    case 'create':
      if (!migrationName) {
        console.error("Error: Please provide a name for the migration.");
        process.exit(1);
      }
      await umzug.create({
        name: migrationName + '.js',
        folder: 'migrations'
      });
      console.log(`New migration file created: ${migrationName}.js`);
      break;

    case 'up':
      await umzug.up();
      console.log('All pending migrations have been applied.');
      break;

    case 'down':
      await umzug.down();
      console.log('The last migration has been reverted.');
      break;
    
    default:
        console.log('Command not recognized. Use "create <name>", "up", or "down".');
        break;
  }

  await mongoose.disconnect();
};

run();