/**
 * @fileoverview user.test.js file for the MetaCat <Metadata Catalog> API.
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


// test/user.test.js
'use strict';

process.env.NODE_ENV = 'test';

const { connectTestDB, disconnectTestDB } = require('./helpers/testDatabase');
const { UserModel } = require('../src/v1/database/modular/UserSchema');
const { RecordModel } = require('../src/v1/database/modular/RecordSchema');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server');

chai.should();
chai.use(chaiHttp);

// ----- INIZIO DELLA SUITE DI TEST -----
describe('User Specific API (/api/v1/me)', () => {

  let testUser;
  let userToken;

  // ----- SETUP INIZIALE -----
  before(async () => {
    await connectTestDB();
    // Pulisce le collezioni
    await UserModel.deleteMany({});
    await RecordModel.model.deleteMany({});

    // 1. Crea un utente di test
    testUser = new UserModel({ username: 'me_user', email: 'me@example.com', password: 'password123' });
    await testUser.save();

    // 2. Crea dei record associati a questo utente
    //    - 2 bozze (published: false)
    //    - 1 pubblicato (published: true)
    await RecordModel.model.create([
      { record: { id: 'uuid-draft-1' }, metadata: 'metadataref1', owner: testUser._id, published: false },
      { record: { id: 'uuid-draft-2' }, metadata: 'metadataref2', owner: testUser._id, published: false },
      { record: { id: 'uuid-published-1' }, metadata: 'metadataref3', owner: testUser._id, published: true },
    ]);

    // 3. Esegui il login per ottenere un token valido per i test
    const res = await chai.request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'me@example.com', password: 'password123' });
    userToken = res.body.token;
  });

  // ----- TEARDOWN FINALE -----
  after(async () => {
    await disconnectTestDB();
  });

  /*
   * Test della rotta GET /me/records
   */
  describe('GET /me/records', () => {

    it('should FAIL if no authentication token is provided', async () => {
      const res = await chai.request(app).get('/api/v1/me/records');
      res.should.have.status(401); // Unauthorized (o 403 a seconda dell'implementazione)
      res.body.should.have.property('type').equal('UserError');
    });

    it('should GET all records (3) (drafts and published) for the authenticated user', async () => {
      const res = await chai.request(app)
        .get('/api/v1/me/records')
        .set('Authorization', `Bearer ${userToken}`); // <-- Usa il token

      res.should.have.status(200);
      res.body.should.be.an('object');
      res.body.data.docs.should.be.an('array').with.lengthOf(3);
      res.body.hits.should.equal(3);
    });

    it('should GET only DRAFT records (2)when using ?published=false filter', async () => {
      const res = await chai.request(app)
        .get('/api/v1/me/records?published=false')
        .set('Authorization', `Bearer ${userToken}`);

      res.should.have.status(200);
      res.body.data.docs.should.be.an('array').with.lengthOf(2);
      res.body.hits.should.equal(2);
      res.body.data.docs.forEach(record => {
        record.published.should.be.false;
      });
    });

    it('should GET only PUBLISHED records (1) when using ?published=true filter', async () => {
      const res = await chai.request(app)
        .get('/api/v1/me/records?published=true')
        .set('Authorization', `Bearer ${userToken}`);

      res.should.have.status(200);
      res.body.data.docs.should.be.an('array').with.lengthOf(1);
      res.body.hits.should.equal(1);
      res.body.data.docs[0].published.should.be.true;
    });

  });

});
