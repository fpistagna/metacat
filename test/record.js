'use strict';

process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const { connectDB } = require('../src/v1/database/modular/mongoose');
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
  let normalUser, curatorUser, adminUser;
  let userToken, curatorToken, adminToken;
  let userDraftRecord, userPublishedRecord;

  // Hook globale: eseguito una volta prima di tutti i test
  before(async () => {
    await connectDB();
    // Pulizia completa
    await UserModel.deleteMany({});
    await RecordModel.model.deleteMany({});
    await RecordMetadataModel.model.deleteMany({});

    // --- Creazione degli Utenti ---
    normalUser = await UserModel.create({ username: 'normaluser', email: 'user@example.com', password: 'password123', role: 'user' });
    curatorUser = await UserModel.create({ username: 'curatoruser', email: 'curator@example.com', password: 'password123', role: 'curator' });
    adminUser = await UserModel.create({ username: 'adminuser', email: 'admin@example.com', password: 'password123', role: 'admin' });

    // --- Login e Ottenimento dei Token ---
    const userRes = await chai.request(app).post('/api/v1/auth/login').send({ email: 'user@example.com', password: 'password123' });
    userToken = userRes.body.token;
    const curatorRes = await chai.request(app).post('/api/v1/auth/login').send({ email: 'curator@example.com', password: 'password123' });
    curatorToken = curatorRes.body.token;
    const adminRes = await chai.request(app).post('/api/v1/auth/login').send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminRes.body.token;

    // --- Creazione dei Record di Test ---
    const metadata1 = await RecordMetadataModel.model.create({ _id: '10.test/draft', type: 'dois', attributes: { doi: '10.test/draft', creators: [{ name: 'Test' }], titles: [{ title: 'Test' }], publisher: { name: 'Test' }, publicationYear: '2025', resourceType: { resourceTypeGeneral: 'Dataset' }, identifiers: [{ identifier: 'test', identifierType: 'Other' }] } });
    const metadata2 = await RecordMetadataModel.model.create({ _id: '10.test/published', type: 'dois', attributes: { doi: '10.test/published', creators: [{ name: 'Test' }], titles: [{ title: 'Test' }], publisher: { name: 'Test' }, publicationYear: '2025', resourceType: { resourceTypeGeneral: 'Dataset' }, identifiers: [{ identifier: 'test', identifierType: 'Other' }] } });

    userDraftRecord = await RecordModel.model.create({ record: { id: 'uuid-draft' }, metadata: metadata1._id, owner: normalUser._id, published: false });
    userPublishedRecord = await RecordModel.model.create({ record: { id: 'uuid-published' }, metadata: metadata2._id, owner: normalUser._id, published: true });
  });

  after(async () => {
    await mongoose.disconnect();
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

    it('should allow an admin to delete a record', async () => {
      const res = await chai.request(app)
        .delete(`/api/v1/records/${userPublishedRecord._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      res.should.have.status(204); // No Content
    });
  });

});