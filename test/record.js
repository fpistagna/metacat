//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const { RecordModel } = require('../src/v1/database/modular/Schema');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server.test');
let should = chai.should();


chai.use(chaiHttp);
//Our parent block
describe('Records Chai Tests', () => {
  before('Delete All Records', async () => { //Before each test we empty the database
    await RecordModel.model.deleteMany({});
  });
/*
  * Test the /GET route
  */
describe('/GET Records', () => {
  it('it should GET no records', (done) => {
    chai.request(server)
      .get('/api/v1/records')
      .end((err, res) => {
        res.should.have.status(204);
        res.body.should.be.a('object');
        //res.body.length.should.be.eql(0);
        done();
      });
  });
});

  /*
  * Test the /POST route
  */
  describe('/POST Record', () => {
      it('it should not POST a record without the `publisher` required field', (done) => {
          let record = require('../sample_data/example_error.json');
        chai.request(server)
            .post('/api/v1/records')
            .send(record)
            .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('status');
              res.body.should.have.property('status').equal('error');
              res.body.should.have.property('error');
              res.body.error[0].should.have.property('params');
              res.body.error[0].params.should.have.property('missingProperty');
              res.body.error[0].params.should.have.property('missingProperty').equal('publisher')
              done();
            });
      });
  });

  describe('/POST Record', () => {
    it('it should POST a record', (done) => {
      let record = require('../sample_data/example.json');
      chai.request(server)
        .post('/api/v1/records')
        .send(record)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('record');
          res.body.record.should.have.property('doi');
          res.body.record.should.have.property('doi').equal(record.metadata.attributes.doi);
          done();
        });
    });
  });
});