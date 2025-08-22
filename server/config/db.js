const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Erro de Conexão com MongoDB: ${err.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;
