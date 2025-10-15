'use strict';

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const { connectDB } = require('../src/v1/database/modular/mongoose');
const { UserModel } = require('../src/v1/database/modular/UserSchema');

// --- Configurazione ---
const BASE_URL = 'http://localhost:3000/api/v1';
const NUM_USERS = 5;
const RECORDS_PER_USER_ITERATION = 10;

// --- Funzioni Helper ---
const logStep = (message) => console.log(`\n\x1b[36m--- ${message} ---\x1b[0m`);
const logSuccess = (message) => console.log(`✅ ${message}`);
const logInfo = (message) => console.log(`   - ${message}`);

// Funzione per creare un record JSON dummy e unico
const createDummyRecord = (uniqueIdentifier) => {
  const doi = `10.9999/dummy.${uniqueIdentifier}`;
  return {
    metadata: {
      id: doi,
      type: "dois",
      attributes: {
        doi: doi,
        creators: [{ name: `Author ${uniqueIdentifier}` }],
        titles: [{ title: `Dummy Record Title ${uniqueIdentifier}` }],
        publisher: { name: "Test Publisher" },
        publicationYear: "2025",
        resourceType: { resourceTypeGeneral: "Dataset" },
        identifiers: [{ identifier: uniqueIdentifier, identifierType: "Other" }]
      }
    }
  };
};

// --- Script Principale ---
const runSeed = async () => {
  logStep('INIZIO SCRIPT DI SEEDING');
  await connectDB();

  const users = [];
  const tokens = [];

  // a) Creare 5 utenti
  logStep(`FASE A: Creazione di ${NUM_USERS} utenti`);
  for (let i = 1; i <= NUM_USERS; i++) {
    const userData = {
      username: `author_${i}`,
      email: `author_${i}@example.com`,
      password: `password_${i}`
    };
    await axios.post(`${BASE_URL}/auth/register`, userData);
    users.push(userData);
    logInfo(`Creato utente: ${userData.email}`);
  }
  logSuccess(`${NUM_USERS} utenti creati.`);

  // b) Iterare 10 volte e creare record per ogni utente
  logStep(`FASE B: Creazione di ${RECORDS_PER_USER_ITERATION} record per ogni utente (Totale: ${NUM_USERS * RECORDS_PER_USER_ITERATION})`);
  for (let i = 0; i < RECORDS_PER_USER_ITERATION; i++) {
    logInfo(`Iterazione ${i + 1}/${RECORDS_PER_USER_ITERATION}...`);
    for (const user of users) {
      // b1.1) Login per ottenere il token
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, { email: user.email, password: user.password });
      const token = loginRes.data.token;
      
      // b1.2) Upload di un record dummy
      const dummyRecord = createDummyRecord(`${user.username}_${i}`);
      await axios.post(`${BASE_URL}/records`, dummyRecord, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  }
  logSuccess(`${NUM_USERS * RECORDS_PER_USER_ITERATION} record creati.`);

  // c) Registrare e promuovere un utente curator
  logStep('FASE C: Creazione e promozione utente "curator"');
  const curatorData = { username: 'curator', email: 'curator@example.com', password: 'curatorpassword' };
  await axios.post(`${BASE_URL}/auth/register`, curatorData);
  await UserModel.updateOne({ email: curatorData.email }, { $set: { role: 'curator' } });
  logSuccess(`Utente ${curatorData.email} creato e promosso a curator.`);

  // d) Autenticarsi come curator
  logStep('FASE D: Login come curator');
  const curatorLoginRes = await axios.post(`${BASE_URL}/auth/login`, { email: curatorData.email, password: curatorData.password });
  const curatorToken = curatorLoginRes.data.token;
  logSuccess('Login come curator effettuato.');

  // e) Chiamare l'endpoint per le bozze
  logStep('FASE E: Recupero di tutte le bozze (records?published=false)');
  const draftsRes = await axios.get(`${BASE_URL}/records?published=false`, {
    headers: { 'Authorization': `Bearer ${curatorToken}` }
  });
  const paginationResult = draftsRes.data.data;
  const draftRecords = paginationResult.docs;
  logSuccess(`Trovati ${draftRecords.length} record in stato di bozza.`);

  // f) Prendere metà dei record casualmente e pubblicarli
  if (draftRecords.length > 0) {
    logStep(`FASE F: Pubblicazione di metà delle bozze (${Math.floor(draftRecords.length / 2)})`);
    
    // Mescola l'array per prendere elementi casuali
    const shuffledDrafts = draftRecords.sort(() => 0.5 - Math.random());
    const recordsToPublish = shuffledDrafts.slice(0, Math.floor(draftRecords.length / 2));

    const publishPromises = recordsToPublish.map(record => {
      logInfo(`Pubblicazione del record ID: ${record._id}`);
      return axios.post(`${BASE_URL}/records/${record._id}/publish`, {}, {
        headers: { 'Authorization': `Bearer ${curatorToken}` }
      });
    });

    await Promise.all(publishPromises);
    logSuccess(`${recordsToPublish.length} record pubblicati con successo.`);
  }

  await mongoose.disconnect();
  logStep('PROCESSO COMPLETATO');
};

// Esegui lo script e gestisci eventuali errori
runSeed().catch(err => {
  if (err.response) {
    console.error('\n\x1b[31m--- ERRORE API ---');
    console.error(`Status: ${err.response.status}`);
    console.error(`Data: ${JSON.stringify(err.response.data)}`);
    console.error('------------------\x1b[0m');
  } else {
    console.error('\n\x1b[31m--- ERRORE SCRIPT ---');
    console.error(err);
    console.error('---------------------\x1b[0m');
  }
  mongoose.disconnect();
  process.exit(1);
});