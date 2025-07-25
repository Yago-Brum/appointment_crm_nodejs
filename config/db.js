const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // As opções abaixo não são mais estritamente necessárias no Mongoose 6+
      // mas podem ser mantidas para compatibilidade ou para clareza em versões mais antigas
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true, // Não suportado em Mongoose 6+
      // useFindAndModify: false // Não suportado em Mongoose 6+
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Erro de Conexão com MongoDB: ${err.message}`);
    process.exit(1); // Sai do processo com falha
  }
};

module.exports = connectDB;
