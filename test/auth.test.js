// test/auth.test.js
'use strict';

process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const { connectDB } = require('../src/v1/database/modular/mongoose');
const { UserModel } = require('../src/v1/database/modular/UserSchema');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/server'); // Importiamo la nostra app Express

chai.should();
chai.use(chaiHttp);

// ----- GESTIONE SETUP E TEARDOWN -----
before(async () => {
  try {
    await connectDB();
    await UserModel.deleteMany({}); // Pulisce la collezione degli utenti
  } catch (error) {
    console.error("Error during test setup:", error);
    throw error;
  }
});

after(async () => {
  await mongoose.disconnect();
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
        password: 'wrongpassword'
      };

      const res = await chai.request(app)
        .post('/api/v1/auth/login')
        .send(credentials);

      res.should.have.status(403);
      res.body.should.have.property('type').equal('UserError');
      res.body.should.have.property('errorCode').equal(32);    
    });
  });

});