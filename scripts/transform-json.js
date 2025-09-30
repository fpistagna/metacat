/**
 * @fileoverview transform-json.js file for the MetaCat <Metadata Catalog> API.
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

// --- Funzione Principale di Trasformazione ---
function transformDataCite(inputData) {
  // Crea una copia dell'input per non modificare l'oggetto originale
  const attributes = { ...inputData };

  // Direttiva 1: Converte `publicationYear` da number a string
  if (attributes.publicationYear && typeof attributes.publicationYear === 'number') {
    attributes.publicationYear = String(attributes.publicationYear);
  }

  // Direttiva 2: Aggiunge l'oggetto `resourceType` basandosi su `types`
  if (attributes.types && typeof attributes.types === 'object') {
    attributes.resourceType = {
      resourceType: attributes.types.resourceType,
      resourceTypeGeneral: attributes.types.resourceTypeGeneral
    };
    // Rimuoviamo la vecchia chiave 'types' per pulizia
    delete attributes.types;
  }
  
  // Direttiva 3: Converte gli array dei funderIdentifier(s) in
  // array con 'oggetto `funderIdentifier` ben composti (datacite 4.6)
  if (Array.isArray(attributes.fundingReferences)) {
    attributes.fundingReferences.forEach((e, i) => {
      if ((e.funderIdentifier &&
        typeof e.funderIdentifier === 'string') &&
        (e.funderIdentifierType &&
          typeof e.funderIdentifierType === 'string')) {
        let funderIdentifier = e.funderIdentifier;
        delete e.funderIdentifier;
        e.funderIdentifier = {
          funderIdentifier: funderIdentifier,
          funderIdentifierType: e.funderIdentifierType
        };
        delete e.funderIdentifierType;
      }
    })
  }

  // Direttiva 4: Costruisce la struttura finale
  const finalStructure = {
    metadata: {
      id: attributes.id, // Prende l'id dall'input
      type: "dois",     // Valore fisso
      attributes: attributes
    }
  };

  return finalStructure;
}


// --- Logica di Esecuzione dello Script ---
const run = () => {
  // Leggi il percorso del file dagli argomenti della riga di comando
  const inputFilePath = process.argv[2];

  if (!inputFilePath) {
    console.error('\x1b[31m%s\x1b[0m', 'Errore: Per favore, specifica il percorso del file JSON di input.');
    console.log('Esempio: npm run transform:json -- ./percorso/file.json');
    process.exit(1);
  }

  try {
    // Leggi e analizza il file JSON
    const fileContent = fs.readFileSync(path.resolve(inputFilePath), 'utf8');
    const inputJson = JSON.parse(fileContent);

    // Esegui la trasformazione
    const transformedJson = transformDataCite(inputJson);

    // Stampa il risultato finale, ben formattato
    console.log(JSON.stringify(transformedJson, null, 2));

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `Si è verificato un errore: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}

module.exports = {
  transformDataCite
};