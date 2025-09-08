'use strict';

/** @type {import('umzug').MigrationFn<any>} */
module.exports.up = async ({ context: connection }) => {
  // Connection is passed by umzug from the migration context
  const usersCollection = connection.collection('users');
  // Ad 'notes' field to users collection. It is a string, defaulting to empty string.
  await usersCollection.updateMany(
    { notes: { $exists: false } }, // Condition: apply only to documents where 'notes' does not exist
    { $set: { notes: '' } }        // Action: set 'notes' field to empty string
  );
};

/** @type {import('umzug').MigrationFn<any>} */
module.exports.down = async ({ context: connection }) => {
  const usersCollection = connection.collection('users');

  await usersCollection.updateMany(
    {}, // Condition: apply to all documents
    { $unset: { notes: 1 } } // Action: remove 'notes' field
  );
};