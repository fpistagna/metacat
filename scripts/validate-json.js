'use strict';

const fs = require('fs');
const path = require('path');
const { ajv } = require('../src/v1/services/ajvService');

// Questo script valida un file JSON contro lo schema principale ('root') definito in ajvService.js.

const runValidation = () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('\x1b[31m%s\x1b[0m', 'Errore: Specifica il percorso del file JSON da validare.');
    console.log('Uso: npm run validate:json -- <percorso/del/file.json>');
    process.exit(1);
  }

  try {
    const fileContent = fs.readFileSync(path.resolve(filePath), 'utf8');
    const jsonData = JSON.parse(fileContent);

    const validate = ajv.getSchema('root#');
    if (!validate) {
      throw new Error("Impossibile trovare lo schema 'root#'. Assicurati che sia caricato in ajvService.");
    }

    const isValid = validate(jsonData);

    if (isValid) {
      console.log('\x1b[32m%s\x1b[0m', '✅  Validazione completata con successo!');
    } else {
      console.error('\x1b[31m%s\x1b[0m', '❌  Validazione fallita. Dettagli degli errori:');
      console.error(JSON.stringify(validate.errors, null, 2));
      process.exit(1);
    }

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `Errore durante l'esecuzione dello script: ${error.message}`);
    process.exit(1);
  }
};

runValidation();