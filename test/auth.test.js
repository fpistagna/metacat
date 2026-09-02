/**
 * @fileoverview auth.test.js file for the MetaCat <Metadata Catalog> API.
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


// test/auth.test.js
'use strict';

process.env.NODE_ENV = 'test';
process.env.TRUST_PROXY = '1';
process.env.LOGIN_RATE_LIMIT_WINDOW_MS = '60000';
process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS = '3';

const { connectTestDB, disconnectTestDB } = require('./helpers/testDatabase');
const { UserModel } = require('../src/v1/database/modular/UserSchema');
const { redactSensitiveData } = require('../src/utils/loggerHelper');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server'); // Importiamo la nostra app Express

chai.should();
chai.use(chaiHttp);

describe('Logger redaction', () => {
  it('should redact sensitive fields, including nested values', () => {
    const sanitized = redactSensitiveData({
      email: 'user@example.com',
      password: 'secret-password',
      token: 'secret-token',
      Authorization: 'Bearer secret-token',
      authentication: {
        access_token: 'secret-token'
      }
    });

    sanitized.email.should.equal('user@example.com');
    sanitized.password.should.equal('[REDACTED]');
    sanitized.token.should.equal('[REDACTED]');
    sanitized.Authorization.should.equal('[REDACTED]');
    sanitized.authentication.access_token.should.equal('[REDACTED]');
  });

  it('should redact Mongoose documents without exposing their internals', () => {
    const user = new UserModel({
      username: 'logger-user',
      email: 'logger@example.com',
      password: 'secret-password'
    });
    const sanitized = redactSensitiveData({ user });

    sanitized.user.password.should.equal('[REDACTED]');
    sanitized.user.should.not.have.property('$__');
    sanitized.user.should.not.have.property('_doc');
  });
});

describe('Bearer token handling', () => {
  it('should reject an invalid token without echoing its value', async () => {
    const invalidToken = 'invalid-token-sentinel-not-for-logs';
    const res = await chai.request(app)
      .get('/api/v1/me/records')
      .set('Authorization', `Bearer ${invalidToken}`);

    res.should.have.status(401);
    JSON.stringify(res.body).should.not.include(invalidToken);
  });
});

// ----- GESTIONE SETUP E TEARDOWN -----
before(async () => {
  try {
    await connectTestDB();
    await UserModel.deleteMany({}); // Pulisce la collezione degli utenti
  } catch (error) {
    console.error("Error during test setup:", error);
    throw error;
  }
});

after(async () => {
  await disconnectTestDB();
});

describe('Authentication API (/api/v1/auth)', () => {

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe('POST /register', () => {
    it('it should register a new user successfully', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'A-Strong-Password-123!'
      };

      const res = await chai.request(app)
        .post('/api/v1/auth/register')
        .send(newUser);

      res.should.have.status(201);
      res.body.should.be.a('object');
      res.body.should.have.property('token');
    });

    it('it should fail to register a user with an existing email', async () => {
      // Prima creiamo un utente
      const existingUser = new UserModel({ username: 'existinguser', email: 'exists@example.com', password: 'password123' });
      await existingUser.save();

      // Poi proviamo a registrarne un altro con la stessa email
      const newUser = {
        username: 'anotheruser',
        email: 'exists@example.com',
        password: 'A-Strong-Password-123!'
      };

      const res = await chai.request(app)
        .post('/api/v1/auth/register')
        .send(newUser);

      res.should.have.status(400); // O il codice di errore specifico del tuo errorHandler
      res.body.should.have.property('type').equal('UserError');
      res.body.should.have.property('errorCode').equal(30);
    });
  });

  describe('POST /login', () => {
    // Creiamo un utente di test prima di eseguire i test di login
    beforeEach(async () => {
      const testUser = new UserModel({ username: 'loginuser', email: 'login@example.com', password: 'password123' });
      await testUser.save();
    });

    it('it should login an existing user and return a token', async () => {
      const credentials = {
        email: 'login@example.com',
        password: 'password123'
      };

      const res = await chai.request(app)
        .post('/api/v1/auth/login')
        .send(credentials);

      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('token');
    });

    it('it should fail to login with a wrong password', async () => {
      const credentials = {
        email: 'login@example.com',
        password: 'wrongpassword-not-for-logs'
      };

      const res = await chai.request(app)
        .post('/api/v1/auth/login')
        .send(credentials);

      res.should.have.status(403);
      res.body.should.have.property('type').equal('UserError');
      res.body.should.have.property('errorCode').equal(32);
      JSON.stringify(res.body).should.not.include(credentials.password);
    });

    it('it should not count successful logins towards the rate limit', async () => {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const res = await chai.request(app)
          .post('/api/v1/auth/login')
          .set('X-Forwarded-For', '203.0.113.10')
          .send({ email: 'login@example.com', password: 'password123' });

        res.should.have.status(200);
      }
    });

    it('it should rate limit repeated failed login attempts from the same IP', async () => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const res = await chai.request(app)
          .post('/api/v1/auth/login')
          .set('X-Forwarded-For', '203.0.113.20')
          .send({ email: 'login@example.com', password: 'wrongpassword' });

        res.should.have.status(403);
      }

      const limitedResponse = await chai.request(app)
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', '203.0.113.20')
        .send({ email: 'login@example.com', password: 'wrongpassword' });

      limitedResponse.should.have.status(429);
      limitedResponse.headers.should.have.property('ratelimit');
      limitedResponse.headers.should.have.property('retry-after');
      limitedResponse.body.should.have.property('type').equal('RateLimitError');
      limitedResponse.body.should.have.property('errorCode').equal(60);
    });
  });

});
