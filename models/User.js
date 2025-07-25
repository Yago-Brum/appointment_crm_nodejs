const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");  //const bcrypt is used for hashing passwords
const jwt = require("jsonwebtoken");  //const jwt is used for generating JSON Web Tokens

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: [6, "The password must be at least 6 characters long"],
    select: false,  //disable password selection by default
  },
  role: {
    type: String,
    enum: ["admin", "employee"], 
    default: "employee",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- Middleware Mongoose (Hooks) ---

// crptograph password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // only hash the password if it has been modified or is new
    next();
  }
  const salt = await bcrypt.genSalt(10); // Create a salt with 10 rounds
  this.password = await bcrypt.hash(this.password, salt); // Hashing da senha
  next();
});


// create a JSON Web Token for the user
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// compare the entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
