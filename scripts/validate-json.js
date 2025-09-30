/**
 * @fileoverview validate-json.js file for the MetaCat <Metadata Catalog> API.
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