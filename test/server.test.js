/**
 * @fileoverview server.test.js file for the MetaCat <Metadata Catalog> API.
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

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const app = require('../src/server');
const { withAsyncHandler } = require('../src/utils/asyncHandler');

chai.should();
chai.use(chaiHttp);

describe('Express application', () => {
  it('returns 404 for an unknown route through the ephemeral test server', async () => {
    const response = await chai.request(app).get('/route-that-does-not-exist');

    response.should.have.status(404);
  });
});

describe('Async error handler', () => {
  const createErrorApp = (handler) => {
    const errorApp = express();

    errorApp.get('/error', withAsyncHandler(handler));
    errorApp.use((error, req, res, next) => {
      res.status(500).json({ message: error.message });
    });

    return errorApp;
  };

  it('forwards rejected promises to the Express error middleware', async () => {
    const errorApp = createErrorApp(async () => {
      throw new Error('async failure');
    });

    const response = await chai.request(errorApp).get('/error');

    response.should.have.status(500);
    response.body.message.should.equal('async failure');
  });

  it('forwards synchronous throws to the Express error middleware', async () => {
    const errorApp = createErrorApp(() => {
      throw new Error('sync failure');
    });

    const response = await chai.request(errorApp).get('/error');

    response.should.have.status(500);
    response.body.message.should.equal('sync failure');
  });
});
