/**
 * @fileoverview record.js file for the MetaCat <Metadata Catalog> API.
 * @copyright 2025 Fabrizio Pistagna <fabrizio.pistagna@ingv.it> - INGV Sezione Catania - Osservatorio Etneo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


'use strict';

process.env.NODE_ENV = 'test';

const { connectTestDB, disconnectTestDB } = require('./helpers/testDatabase');
const { UserModel } = require('../src/v1/database/modular/UserSchema');
const { RecordModel } = require('../src/v1/database/modular/RecordSchema');
const { RecordMetadataModel } = require('../src/v1/database/modular/RecordMetadataSchema');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server');

chai.should();
chai.use(chaiHttp);

describe('Records API (/api/v1/records)', () => {

  // Variabili che useremo in tutti i test
  let normalUser, otherUser, curatorUser, adminUser;
  let userToken, otherUserToken, curatorToken, adminToken;
  let userDraftRecord, userPublishedRecord, fullUpdateDraftRecord;
  let transactionDeleteRecord;

  // Hook globale: eseguito una volta prima di tutti i test
  before(async () => {
    await connectTestDB();
    // Pulizia completa
    await UserModel.deleteMany({});
    await RecordModel.model.deleteMany({});
    await RecordMetadataModel.model.deleteMany({});

    // --- Creazione degli Utenti ---
    normalUser = await UserModel.create({ username: 'normaluser', email: 'user@example.com', password: 'password123', role: 'user' });
    otherUser = await UserModel.create({ username: 'otheruser', email: 'other@example.com', password: 'password123', role: 'user' });
    curatorUser = await UserModel.create({ username: 'curatoruser', email: 'curator@example.com', password: 'password123', role: 'curator' });
    adminUser = await UserModel.create({ username: 'adminuser', email: 'admin@example.com', password: 'password123', role: 'admin' });

    // --- Login e Ottenimento dei Token ---
    const userRes = await chai.request(app).post('/api/v1/auth/login').send({ email: 'user@example.com', password: 'password123' });
    userToken = userRes.body.token;
    const otherUserRes = await chai.request(app).post('/api/v1/auth/login').send({ email: 'other@example.com', password: 'password123' });
    otherUserToken = otherUserRes.body.token;
    const curatorRes = await chai.request(app).post('/api/v1/auth/login').send({ email: 'curator@example.com', password: 'password123' });
    curatorToken = curatorRes.body.token;
    const adminRes = await chai.request(app).post('/api/v1/auth/login').send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminRes.body.token;

    // --- Creazione dei Record di Test ---
    const metadata1 = await RecordMetadataModel.model.create({ _id: '10.test/draft', type: 'dois', attributes: { doi: '10.test/draft', creators: [{ name: 'Test' }], titles: [{ title: 'Test' }], publisher: { name: 'Test' }, publicationYear: '2025', resourceType: { resourceTypeGeneral: 'Dataset' }, identifiers: [{ identifier: 'test', identifierType: 'Other' }] } });
    const metadata2 = await RecordMetadataModel.model.create({ _id: '10.test/published', type: 'dois', attributes: { doi: '10.test/published', creators: [{ name: 'Test' }], titles: [{ title: 'Test' }], publisher: { name: 'Test' }, publicationYear: '2025', resourceType: { resourceTypeGeneral: 'Dataset' }, identifiers: [{ identifier: 'test', identifierType: 'Other' }] } });
    const metadata3 = await RecordMetadataModel.model.create({ _id: '10.test/full-update', type: 'dois', attributes: { doi: '10.test/full-update', creators: [{ name: 'Original Creator' }], titles: [{ title: 'Original title' }], publisher: { name: 'Original Publisher' }, publicationYear: '2025', resourceType: { resourceTypeGeneral: 'Dataset' }, identifiers: [{ identifier: 'test', identifierType: 'Other' }] } });
    const metadata4 = await RecordMetadataModel.model.create({ _id: '10.test/transaction-delete', type: 'dois', attributes: { doi: '10.test/transaction-delete', creators: [{ name: 'Test' }], titles: [{ title: 'Transaction delete test' }], publisher: { name: 'Test' }, publicationYear: '2025', resourceType: { resourceTypeGeneral: 'Dataset' }, identifiers: [{ identifier: 'test', identifierType: 'Other' }] } });

    userDraftRecord = await RecordModel.model.create({ record: { id: 'uuid-draft' }, metadata: metadata1._id, owner: normalUser._id, published: false });
    userPublishedRecord = await RecordModel.model.create({ record: { id: 'uuid-published' }, metadata: metadata2._id, owner: normalUser._id, published: true });
    fullUpdateDraftRecord = await RecordModel.model.create({ record: { id: 'uuid-full-update' }, metadata: metadata3._id, owner: normalUser._id, published: false });
    transactionDeleteRecord = await RecordModel.model.create({ record: { id: 'uuid-transaction-delete' }, metadata: metadata4._id, owner: normalUser._id, published: false });
  });

  after(async () => {
    await disconnectTestDB();
  });

  describe('Record schema', () => {
    it('should generate a UUID v4 when the record identifier is omitted', async () => {
      const record = await RecordModel.model.create({
        metadata: userDraftRecord.metadata,
        owner: normalUser._id
      });

      record.record.id.should.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });

  // ==========================================
  // TEST SULL'ENDPOINT POST /api/v1/records
  // ==========================================
  describe('POST /', () => {
    it('should roll back metadata when record creation fails', async () => {
      const payload = structuredClone(require('./sample.json'));
      const doi = '10.1234/transaction-create';
      payload.metadata.id = doi;
      payload.metadata.attributes.doi = doi;

      const originalCreateRecord = RecordModel.createRecordWithMetadata;
      RecordModel.createRecordWithMetadata = async () => {
        throw new Error('Forced record creation failure');
      };

      let res;
      try {
        res = await chai.request(app)
          .post('/api/v1/records')
          .set('Authorization', `Bearer ${userToken}`)
          .send(payload);
      } finally {
        RecordModel.createRecordWithMetadata = originalCreateRecord;
      }

      res.should.have.status(500);
      const orphanedMetadata = await RecordMetadataModel.model.findById(doi);
      chai.expect(orphanedMetadata).to.equal(null);
    });
  });

  // ===============================================
  // TEST SULL'ENDPOINT GET /api/v1/records/:recordId
  // ===============================================
  describe('GET /:recordId', () => {
    it('should allow anyone to see a published record', async () => {
      const res = await chai.request(app).get(`/api/v1/records/${userPublishedRecord._id}`);
      res.should.have.status(200);
      res.body.data.record.id.should.equal(userPublishedRecord.record.id);
    });

    it('should NOT allow an unauthenticated user to see a draft record', async () => {
      const res = await chai.request(app).get(`/api/v1/records/${userDraftRecord._id}`);
      res.should.have.status(401); // Unauthorized
    });

    it('should allow the owner to see their own draft record', async () => {
      const res = await chai.request(app)
        .get(`/api/v1/records/${userDraftRecord._id}`)
        .set('Authorization', `Bearer ${userToken}`);
      res.should.have.status(200);
      res.body.data.record.id.should.equal(userDraftRecord.record.id);
    });

    it('should allow a curator to see another user\'s draft record', async () => {
      const res = await chai.request(app)
        .get(`/api/v1/records/${userDraftRecord._id}`)
        .set('Authorization', `Bearer ${curatorToken}`);
      res.should.have.status(200);
    });
  });

  // =========================================================
  // TEST SULL'ENDPOINT GET /api/v1/records/:recordId/:attribute
  // =========================================================
  describe('GET /:recordId/:attribute', () => {
    it('should allow anyone to read an attribute of a published record', async () => {
      const res = await chai.request(app)
        .get(`/api/v1/records/${userPublishedRecord._id}/titles`);

      res.should.have.status(200);
      res.body.values.should.deep.equal([{ title: 'Test' }]);
    });

    it('should NOT allow an unauthenticated user to read an attribute of a draft record', async () => {
      const res = await chai.request(app)
        .get(`/api/v1/records/${userDraftRecord._id}/titles`);

      res.should.have.status(401);
    });

    it('should allow the owner to read an attribute of their own draft record', async () => {
      const res = await chai.request(app)
        .get(`/api/v1/records/${userDraftRecord._id}/titles`)
        .set('Authorization', `Bearer ${userToken}`);

      res.should.have.status(200);
      res.body.values.should.deep.equal([{ title: 'Test' }]);
    });

    it('should NOT allow another user to read an attribute of a draft record', async () => {
      const res = await chai.request(app)
        .get(`/api/v1/records/${userDraftRecord._id}/titles`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      res.should.have.status(403);
    });

    it('should allow a curator to read an attribute of another user\'s draft record', async () => {
      const res = await chai.request(app)
        .get(`/api/v1/records/${userDraftRecord._id}/titles`)
        .set('Authorization', `Bearer ${curatorToken}`);

      res.should.have.status(200);
    });
  });

  // ===========================================================
  // TEST SULL'ENDPOINT PATCH /api/v1/records/:recordId/:attribute
  // ===========================================================
  describe('PATCH /:recordId/:attribute', () => {
    it('should NOT allow an unauthenticated user to update an attribute', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${userDraftRecord._id}/titles`)
        .send([{ title: 'Unauthorized update' }]);

      res.should.have.status(401);
    });

    it('should NOT allow another user to update an attribute of a draft record', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${userDraftRecord._id}/titles`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send([{ title: 'Forbidden update' }]);

      res.should.have.status(403);
      const unchangedRecord = await RecordModel.recordWithId(userDraftRecord._id);
      unchangedRecord.metadata.attributes.titles[0].title.should.equal('Test');
    });

    it('should allow the owner to update an attribute of their own draft record', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${userDraftRecord._id}/titles`)
        .set('Authorization', `Bearer ${userToken}`)
        .send([{ title: 'Updated draft title' }]);

      res.should.have.status(201);
      const updatedRecord = await RecordModel.recordWithId(userDraftRecord._id);
      updatedRecord.metadata.attributes.titles[0].title.should.equal('Updated draft title');
    });

    it('should NOT allow the owner to update an attribute of their published record', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${userPublishedRecord._id}/titles`)
        .set('Authorization', `Bearer ${userToken}`)
        .send([{ title: 'Forbidden published update' }]);

      res.should.have.status(403);
      res.body.should.have.property('errorCode').equal(107);
    });

    it('should allow a curator to update an attribute of another user\'s published record', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${userPublishedRecord._id}/titles`)
        .set('Authorization', `Bearer ${curatorToken}`)
        .send([{ title: 'Curated published title' }]);

      res.should.have.status(201);
      const updatedRecord = await RecordModel.recordWithId(userPublishedRecord._id);
      updatedRecord.metadata.attributes.titles[0].title.should.equal('Curated published title');
    });
  });

  // ==============================================
  // TEST SULL'ENDPOINT PATCH /api/v1/records/:recordId
  // ==============================================
  describe('PATCH /:recordId', () => {
    const updatePayload = {
      metadata: {
        id: '10.test/full-update',
        type: 'dois',
        attributes: {
          titles: [{ title: 'Updated title' }],
          publicationYear: '2026'
        }
      }
    };

    it('should NOT allow an unauthenticated user to update a record', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${fullUpdateDraftRecord._id}`)
        .send(updatePayload);

      res.should.have.status(401);
    });

    it('should NOT allow another user to update a draft record', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${fullUpdateDraftRecord._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updatePayload);

      res.should.have.status(403);
    });

    it('should update multiple attributes of an owned draft', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${fullUpdateDraftRecord._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatePayload);

      res.should.have.status(200);
      res.body.status.should.equal('updated');
      res.body.data.metadata.attributes.titles[0].title.should.equal('Updated title');
      res.body.data.metadata.attributes.publicationYear.should.equal('2026');

      const updatedRecord = await RecordModel.recordWithId(fullUpdateDraftRecord._id);
      updatedRecord.metadata.attributes.creators[0].name.should.equal('Original Creator');
      updatedRecord.timestamps.updatedAt.should.be.greaterThan(updatedRecord.timestamps.createdAt);
    });

    it('should reject a DOI change and preserve the existing identity', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${fullUpdateDraftRecord._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ metadata: { attributes: { doi: '10.9999/changed-doi' } } });

      res.should.have.status(409);
      res.body.should.have.property('errorCode').equal(15);

      const unchangedRecord = await RecordModel.recordWithId(fullUpdateDraftRecord._id);
      unchangedRecord.metadata.attributes.doi.should.equal('10.test/full-update');
    });

    it('should NOT allow an owner to update their published record', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${userPublishedRecord._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ metadata: { attributes: { publisher: { name: 'Owner update' } } } });

      res.should.have.status(403);
      res.body.should.have.property('errorCode').equal(107);
    });

    it('should allow a curator to update a published record', async () => {
      const res = await chai.request(app)
        .patch(`/api/v1/records/${userPublishedRecord._id}`)
        .set('Authorization', `Bearer ${curatorToken}`)
        .send({ metadata: { attributes: { publisher: { name: 'Curated Publisher' } } } });

      res.should.have.status(200);
      res.body.data.metadata.attributes.publisher.name.should.equal('Curated Publisher');
    });
  });

  // =====================================================
  // TEST SULL'ENDPOINT POST /api/v1/records/:recordId/publish
  // =====================================================
  describe('POST /:recordId/publish', () => {
    it('should NOT allow a normal user to publish a record', async () => {
      const res = await chai.request(app)
        .post(`/api/v1/records/${userDraftRecord._id}/publish`)
        .set('Authorization', `Bearer ${userToken}`);
      res.should.have.status(403); // Forbidden
      res.body.should.have.property('type').equal('UserError');
    });

    it('should allow a curator to publish a record', async () => {
      const res = await chai.request(app)
        .post(`/api/v1/records/${userDraftRecord._id}/publish`)
        .set('Authorization', `Bearer ${curatorToken}`);
      res.should.have.status(200);
      res.body.data.published.should.be.true;
    });
  });

  // =====================================================
  // TEST SULL'ENDPOINT DELETE /api/v1/records/:recordId
  // =====================================================
  describe('DELETE /:recordId', () => {
    it('should NOT allow a curator to delete a record', async () => {
      const res = await chai.request(app)
        .delete(`/api/v1/records/${userPublishedRecord._id}`)
        .set('Authorization', `Bearer ${curatorToken}`);
      res.should.have.status(403); // Forbidden
    });

    it('should roll back the record deletion when metadata deletion fails', async () => {
      const metadataId = transactionDeleteRecord.metadata.toString();
      const originalDeleteMetadata = RecordMetadataModel.model.findByIdAndDelete;
      RecordMetadataModel.model.findByIdAndDelete = async () => null;

      let res;
      try {
        res = await chai.request(app)
          .delete(`/api/v1/records/${transactionDeleteRecord._id}`)
          .set('Authorization', `Bearer ${adminToken}`);
      } finally {
        RecordMetadataModel.model.findByIdAndDelete = originalDeleteMetadata;
      }

      res.should.have.status(500);
      const preservedRecord = await RecordModel.model.findById(transactionDeleteRecord._id);
      const preservedMetadata = await RecordMetadataModel.model.findById(metadataId);
      chai.expect(preservedRecord).to.not.equal(null);
      chai.expect(preservedMetadata).to.not.equal(null);
    });

    it('should allow an admin to delete a record', async () => {
      const res = await chai.request(app)
        .delete(`/api/v1/records/${userPublishedRecord._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      res.should.have.status(204); // No Content
    });
  });

});
