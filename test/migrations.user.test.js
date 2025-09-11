'use strict';

process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const { exec } = require('child_process');
const { connectDB } = require('../src/v1/database/modular/mongoose');
const chai = require('chai');
const expect = chai.expect;

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}\n${stderr}`);
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}

describe('Database Migrations - add-notes-to-users', () => {

  before(async () => await connectDB());

  after(async () => {
    await runCommand('npm run migrate:down').catch(err => console.log("Could not run migrate:down, maybe no migration was applied."));
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // --- SETUP: Create "Old" aka Original state ---

    // 1. Define OLD(Original) schema (without 'notes')
    //    This schema exactly replicates original real UserSchema.
    const OldUserSchema = new Schema({
      username: { type: String, required: true, unique: true, trim: true },
      email: { type: String, required: true, unique: true, trim: true, lowercase: true },
      password: { type: String, required: true, select: false },
      role: { type: String, enum: ['user', 'admin', 'curator'], default: 'user' },
      orcid: { type: String, unique: true, sparse: true }
    }, { timestamps: true });

    // 2. Compile the temporary model.
    //    `deleteModel` to prevent errors in case the test has been executed more times in a session.
    if (mongoose.models.User) {
      mongoose.deleteModel('User');
    }
    const OldUserModel = mongoose.model('User', OldUserSchema);
    
    // 3. Clean-up the collection and insert an "old" user document
    await OldUserModel.deleteMany({});
    await OldUserModel.create({
      username: 'migration_test',
      email: 'migration@test.com',
      password: 'password123'
    });
  });

  it('should correctly apply the "add-notes-to-users" migration (UP)', async function() {
    this.timeout(10000);

    // --- Action: Execute the Migration ---
    await runCommand('npm run migrate:up');
    
    // 1. Define the NEW schema (with 'notes' field)
    const NewUserSchema = new Schema({
      username: String,
      email: String,
      password: String,
      role: String,
      orcid: String,
      notes: String // <-- New field added by migration
    }, { timestamps: true });

    // 2. Compile a new updated model to perform the query
    if (mongoose.models.User) {
      mongoose.deleteModel('User');
    }
    const NewUserModel = mongoose.model('User', NewUserSchema);
    
    // 3. Look up for user and verify its 'notes' field was added with default value
    const migratedUser = await NewUserModel.findOne({ email: 'migration@test.com' });
    
    expect(migratedUser).to.exist;
    // Key Assert: 'notes' field should exist and be an empty string
    expect(migratedUser.notes).to.exist;
    expect(migratedUser.notes).to.equal('');
  });
});