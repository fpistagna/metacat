/**
 * @fileoverview authService.js file for the MetaCat <Metadata Catalog> API.
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


const { UserModel } = require('../database/modular/UserSchema');
const jwt = require('jsonwebtoken');
const customError = require('../../utils/customError');

const signToken = (userId) => {
  const payload = { user: { id: userId } };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const registerUser = async ({ username, email, password }) => {
  let user = await UserModel.findOne({ email });
  if (user) {
    throw new customError.UserError(30, 
      `User with email ${email} already exists.`, 
      { email: email });
  }

  user = new UserModel({ username, email, password });
  await user.save();

  return signToken(user.id);
};

const loginUser = async ({ email, password }) => {
  // +password forza Mongoose a restituire il campo password, che abbiamo nascosto con select: false
  const user = await UserModel.findOne({ email }).select('+password');
  if (!user) {
    throw new customError.UserError(31, `Invalid credentials (${email}).`,
      { email: email });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new customError.UserError(32, `Wrong password (${password}) ` +
      `for user ${user.username}, email ${user.email}`);
  }

  return signToken(user.id);
};

const axios = require('axios');
const { URLSearchParams } = require('url');

const handleOrcidCallback = async (authorizationCode) => {
  // --- Parte 1: Scambia il codice per un token ORCID ---
  const tokenUrl = 'https://sandbox.orcid.org/oauth/token';
  const params = new URLSearchParams();
  params.append('client_id', process.env.ORCID_CLIENT_ID);
  params.append('client_secret', process.env.ORCID_CLIENT_SECRET);
  params.append('grant_type', 'authorization_code');
  params.append('code', authorizationCode);
  params.append('redirect_uri', process.env.ORCID_REDIRECT_URI);

  try {
    const orcidResponse = await axios.post(tokenUrl, params, {
      headers: { 'Accept': 'application/json' }
    });

    const { orcid, name } = orcidResponse.data;

    if (!orcid) {
      throw new customError.UserError(36, 'Failed to retrieve ORCID iD.');
    }

    // --- Parte 2: Trova o crea l'utente nel nostro DB ---
    let user = await UserModel.findOne({ orcid: orcid });

    if (!user) {
      // Se l'utente non esiste, lo creiamo.
      // L'email potrebbe essere richiesta da uno scope aggiuntivo o gestita in un secondo momento.
      user = new UserModel({
        username: name || orcid, // Usa il nome se disponibile, altrimenti l'iD
        orcid: orcid,
        email: `${orcid}@orcid.local` // Email placeholder
      });
      await user.save();
    }

    // --- Parte 3: Genera e restituisci il nostro JWT interno ---
    return signToken(user.id); // 'signToken' è la funzione che abbiamo già
  } catch (error) {
    if (error.response) {
      // Logghiamo la risposta dettagliata che ORCID ci ha inviato
      // console.error("--- ERRORE DALLA RISPOSTA DI ORCID ---");
      // console.error("Status:", error.response.status);
      // console.error("Headers:", error.response.headers);
      // console.error("Data:", error.response.data);
      // console.error("------------------------------------");

      // Lancia un nostro errore personalizzato con i dettagli di ORCID
      const orcidErrorDetails = JSON.stringify(error.response.data);
      throw new customError.UserError(37, `ORCID server error: ${orcidErrorDetails}`);
    }
    // Altrimenti, è un errore di rete (es. il server non risponde)
    throw new customError.UserError(38, 
      `Network error during ORCID token exchange: ${error.message}`);
  }
};

module.exports = {
  registerUser,
  loginUser,
  handleOrcidCallback
};