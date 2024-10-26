const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let isConnected = false; // Assurez-vous que cette variable est définie ici

const connectDB = async () => {
  // Vérifiez s'il y a déjà une connexion
  if (mongoose.connection.readyState === 0 && !isConnected) {
    try {
      isConnected = true; // Marquez comme connecté
      if (process.env.NODE_ENV === 'test') {
        // Connexion à la base de données de test
        mongoServer = await MongoMemoryServer.create();
        const MONGO_URI_TEST = mongoServer.getUri();
        await mongoose.connect(MONGO_URI_TEST);
        console.log('Connecté à MongoDB In-Memory');
      } else {
        // Connexion à la vraie base de données
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB');
      }
    } catch (error) {
      console.error("Erreur de connexion à MongoDB :", error);
    }
  } else {
    console.log('Connexion à MongoDB déjà établie.');
  }
};

async function disconnectDB() {
  await mongoose.connection.close();
}

module.exports = { connectDB, disconnectDB };
