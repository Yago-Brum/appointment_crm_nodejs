const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Para criptografar as senhas
const jwt = require("jsonwebtoken"); // Para gerar JSON Web Tokens

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Por favor, adicione um nome"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Por favor, adicione um email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Por favor, adicione um email válido",
    ],
  },
  password: {
    type: String,
    required: [true, "Por favor, adicione uma senha"],
    minlength: [6, "A senha deve ter pelo menos 6 caracteres"],
    select: false, // Não retorna a senha na query (segurança)
  },
  role: {
    type: String,
    enum: ["admin", "employee"], // Exemplo de funções: administrador ou funcionário
    default: "employee",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- Middleware Mongoose (Hooks) ---

// Criptografar senha antes de salvar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // Só criptografa se a senha foi modificada
    next();
  }
  const salt = await bcrypt.genSalt(10); // Gera um salt
  this.password = await bcrypt.hash(this.password, salt); // Hashing da senha
  next();
});

// --- Métodos de Instância do Usuário ---

// Gerar e retornar token JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Comparar senha inserida com a senha criptografada no banco de dados
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
