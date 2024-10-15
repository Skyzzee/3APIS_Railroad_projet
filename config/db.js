const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let isConnected = false;

const connectDB = async () => {
  // vérif d'une connexion existante
  if (mongoose.connection.readyState === 0 && !isConnected) {
    try {
      isConnected = true;
      if (process.env.NODE_ENV === 'test') {
        // Connexion à la base de donnée de test
        mongoServer = await MongoMemoryServer.create();
        const MONGO_URI_TEST = mongoServer.getUri();
        await mongoose.connect(MONGO_URI_TEST);
        console.log('Connecté à MongoDB In-Memory');
      } else {
        // Connexion a la vrai base de donnée 
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connecté à MongoDB');
      }
    } catch (error) {
      console.error("Erreur de connexion à MongoDB :", error);
    }
  } else {
    console.log('Connexion à MongoDB déjà établie.');
  }
};


const disconnectDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
