//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const { RecordModel } = require('../src/v1/database/modular/RecordSchema');
const { RecordMetadataModel } = require('../src/v1/database/modular/RecordMetadataSchema');
const { connectDB, disconnectDB } = require('../src/v1/database/modular/mongoose');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
const app = require('../src/server');
const { record } = require('../src/v1/services/recordService');
let should = chai.should();

before(async () => {
  try {
    // 1. Connettiti al database di test.
    await connectDB();
    // 2. Pulisci la collezione prima di iniziare.
    await RecordModel.model.deleteMany({});
    await RecordMetadataModel.model.deleteMany({});
  } catch (error) {
    console.error("Error during test setup:", error);
    // Lancia l'errore per bloccare i test se il setup fallisce
    throw error;
  }
});

// Questo hook viene eseguito UNA SOLA VOLTA, dopo che tutti i test sono finiti.
after(async () => {
  await RecordModel.model.deleteMany({});
  await RecordMetadataModel.model.deleteMany({});
  // Chiudi la connessione per permettere a Mocha di terminare correttamente.
  await disconnectDB();
});

chai.use(chaiHttp);

//Our parent block
describe('Records Chai Tests', () => {
  /*
    * Test the /GET route
    */
  describe('/GET Records', () => {
    it('it should GET no records', (done) => {
      chai.request(app)
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
            let record = require('./sample_error.json');
          chai.request(app)
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
        let record = require('./sample.json');
        chai.request(app)
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

    describe('Delete records from DB', () => {
      before('Delete All Records', async () => { //Before each test we empty the database
        await RecordModel.model.deleteMany({});
      });
    });

    describe('/PATCH/:recordId/:attribute', () => {

      it('it should update the "descriptions" attribute of a specific record', async function () {
        // Aumentiamo il timeout perché questo test fa 3 chiamate API
        this.timeout(5000);

        // ----- STEP 1: Creare un record di partenza su cui lavorare -----
        const initialRecordPayload = require('./sample2.json'); // Usiamo un record valido
        const postRes = await chai.request(app)
          .post('/api/v1/records')
          .send(initialRecordPayload);

        postRes.should.have.status(201);
        const recordId = postRes.body._id; // Estrai l'ID del record appena creato

        // ----- STEP 2: Eseguire la PATCH per aggiornare l'attributo -----
        const attributeToUpdate = 'descriptions';
        const patchPayload = [{
          "description": "Una descrizione modificata",
          "descriptionType": "TechnicalInfo"
        }];

        const patchRes = await chai.request(app)
          .patch(`/api/v1/records/${recordId}/${attributeToUpdate}`)
          .send(patchPayload);

        patchRes.should.have.status(201); // 200 OK è più standard per un update riuscito
        patchRes.body.should.be.a('object');
        patchRes.body.should.have.property('status').equal('updated');

        // ----- STEP 3 (Opzionale ma consigliato): Verificare la modifica -----
        // Chiamiamo l'endpoint GET per il singolo record per assicurarci che i dati siano stati persistiti.
        const getRes = await chai.request(app).get(`/api/v1/records/${recordId}`);

        getRes.should.have.status(200);
        getRes.body.data.metadata.attributes.should.have.property('descriptions');

        const updatedDescriptions = getRes.body.data.metadata.attributes.descriptions;
        updatedDescriptions.should.be.a('array');
        updatedDescriptions.length.should.be.eql(1);
        updatedDescriptions[0].description.should.equal("Una descrizione modificata");
        updatedDescriptions[0].descriptionType.should.equal("TechnicalInfo");
      });

      it('it should fail to update a non-existing record', async () => {
        const nonExistingId = '63a5e3c1a2b3c4d5e6f7a8b9'; // Un ObjectId valido ma inesistente
        const patchPayload = [{ "description": "test", "descriptionType": "Other" }];

        const res = await chai.request(app)
          .patch(`/api/v1/records/${nonExistingId}/descriptions`)
          .send(patchPayload);

        res.should.have.status(404); // O il codice di errore che il tuo controller restituisce
      });
    });
});
