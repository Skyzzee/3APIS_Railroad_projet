const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const TrainModel = require('../models/trainModel');

describe('Tests des routes /train', () => {
  
  beforeAll(async () => {
    await connectDB();
  });
  
  afterAll(async () => {
    await disconnectDB();
  });
  
  afterEach(async () => {
    // Nettoyage des données entre chaque test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany(); // Supprimer les documents
    }
  });

  it('Récupérer tous les trains', async () => {
    const train1 = new TrainModel({ name: 'Train A', start_station: 'Paris', end_station: 'Lyon', time_of_departure: '2024-10-15T10:00:00Z' });
    const train2 = new TrainModel({ name: 'Train B', start_station: 'Lyon', end_station: 'Dijon', time_of_departure: '2024-10-16T15:00:00Z' });
    await train1.save();
    await train2.save();

    const response = await request(app).get('/train/');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Train A');
    expect(response.body[1].name).toBe('Train B');
  });

  it('Enregistrer un nouveau train', async () => {
    const newTrain = { name: 'Train C', start_station: 'Lyon', end_station: 'Toulouse', time_of_departure:'2024-10-16T13:00:00Z' };
    const response = await request(app).post('/train/create').send(newTrain);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Le train a été enregistré avec succès");

    // Vérifie que le train est bien dans la base de données
    const trainInDb = await TrainModel.findOne({ name: 'Train C' });
    expect(trainInDb).not.toBeNull();
    expect(trainInDb.name).toBe('Train C');
  });

  it('Erreur si le train existe déjà', async () => {
    const newTrain = { name: 'Train C', start_station: 'Lyon', end_station: 'Toulouse', time_of_departure:'2024-10-16T13:00:00Z' };
    await request(app).post('/train/create').send(newTrain); // Créer le train 

    const response = await request(app).post('/train/create').send(newTrain); // Essaie de le recréer
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Le train est déjà existant !");
  });

  it('Récupérer un train par ID', async () => {
    const newTrain = new TrainModel({  name: 'Train D', start_station: 'Marseille', end_station: 'Toulouse', time_of_departure:'2024-10-18T17:00:00Z'  });
    await newTrain.save();

    const response = await request(app).get(`/train/${newTrain._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Train D');
  });

  it('Train non trouvé', async () => {
    const response = await request(app).get('/train/60f5f8a2b8a245001c09d9c2'); // Un ID aléatoire
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Train non trouvé');
  });

  it('Modifier un train par ID', async () => {
    const newTrain = new TrainModel({  name: 'Train E', start_station: 'Dijon', end_station: 'Toulouse', time_of_departure:'2024-10-16T15:00:00Z' });
    await newTrain.save();

    const response = await request(app).put(`/train/${newTrain._id}`).send({ name: 'Train Z' });
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Train Z');
  });

  it('Échec si le train n’est pas trouvé lors de la mise à jour', async () => {
    const response = await request(app).put('/train/60f5f8a2b8a245001c09d9c2').send({ name: 'Train Z' });
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Train non trouvé');
  });

  it('Supprimer un train par ID', async () => {
    const newTrain = new TrainModel({  name: 'Train F', start_station: 'Paris', end_station: 'Lille', time_of_departure:'2024-10-17T11:00:00Z'  });
    await newTrain.save();

    const response = await request(app).delete(`/train/${newTrain._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Train F');

    const trainInDb = await TrainModel.findById(newTrain._id);
    expect(trainInDb).toBeNull(); // Vérifie que le train a bien été supprimé
  });

  it('Échec si le train n’est pas trouvé lors de la suppression', async () => {
    const response = await request(app).delete('/train/60f5f8a2b8a245001c09d9c2'); // ID inexistant
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Train non trouvé');
  });
});