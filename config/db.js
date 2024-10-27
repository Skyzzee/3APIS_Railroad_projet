const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let isConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 0 && !isConnected) {
    try {
      isConnected = true;
      if (process.env.NODE_ENV === 'test') { 
        // Si le mode d'environnement dans .env est réglé sur 'test', alors cela créer la base de donnée virtuelle, 
        // et se connecte à elle, sinon cela se connecte à la vrai base de donnée 
        mongoServer = await MongoMemoryServer.create({ debug: true, });
        const MONGO_URI_TEST = mongoServer.getUri();
        await mongoose.connect(MONGO_URI_TEST); // Base de donnée virtuelle 
        console.log('Connecté à MongoDB In-Memory');

      } else {
        await mongoose.connect(process.env.MONGODB_URI); // Vrai base de donnée
        console.log('Connecté à MongoDB');
      }
    } catch (error) {
      console.error('Erreur de connexion à MongoDB :', error);
    }
  } else {
    console.log('Connexion à MongoDB déjà établie.');
  }
};

async function disconnectDB() {
  await mongoose.connection.close(); // Ferme la connection à la base de donnée ( + Supprime les données si c'est de la base de donnée virtuelle )
  await mongoServer.stop();
}

module.exports = { connectDB, disconnectDB };
