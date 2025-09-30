/**
 * @fileoverview UserSchema.js file for the MetaCat <Metadata Catalog> API.
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


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    //required: true,
    select: false // FONDAMENTALE: non restituisce la password nelle query di default
  },
  orcid: {
    type: String,
    unique: true,
    sparse: true // allows multiple null values
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'curator'],
    default: 'user'
  },
  records: [{
    type: String,
    ref: 'Record'
  }]
}, { timestamps: true }); // Aggiunge createdAt e updatedAt

// Middleware di Mongoose: esegue l'hash della password PRIMA di salvare l'utente
userSchema.pre('save', async function (next) {
  // Esegui l'hash solo se la password è stata modificata (o è nuova)
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metodo di istanza per confrontare le password in modo sicuro
userSchema.methods.comparePassword = async function (candidatePassword) {
  // 'this.password' è accessibile qui perché il metodo è chiamato su un'istanza
  // trovata con .select('+password')
  return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model('User', userSchema);
module.exports = { UserModel };
