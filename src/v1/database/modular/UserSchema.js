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
    sparse: true // Ottimo per permettere valori nulli multipli
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'curator'], // Prepara il terreno per l'autorizzazione
    default: 'user'
  }
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
