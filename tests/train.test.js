const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const TrainModel = require('../models/trainModel');
const StationModel = require('../models/stationModel');
const { connectDB, disconnectDB } = require('../config/db');

// Tests des routes pour les trains
describe('Tests des routes des trains', () => {
  let adminToken, userToken, employeeToken, adminId, userId, employeeId, stationAId, stationBId;

  beforeAll(async () => {
    await connectDB();

    // Création d'un administrateur
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new UserModel({ pseudo: 'Admin', email: 'admin@gmail.com', password: adminPassword, role: 'admin' });
    await adminUser.save();
    adminId = adminUser._id;
    adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Création d'un utilisateur normal
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = new UserModel({ pseudo: 'User', email: 'user@gmail.com', password: userPassword, role: 'user' });
    await regularUser.save();
    userId = regularUser._id;
    userToken = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Création d'un employé
    const employeePassword = await bcrypt.hash('employee123', 10);
    const employeeUser = new UserModel({ pseudo: 'Employee', email: 'employee@gmail.com', password: employeePassword, role: 'employee' });
    await employeeUser.save();
    employeeId = employeeUser._id;
    employeeToken = jwt.sign({ id: employeeId, role: 'employee' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Création de deux gares
    const stationA = new StationModel({ name: 'Gare de Dijon', open_hour: '06:00', close_hour: '22:00', image: 'image_url.jpg' });
    const stationB = new StationModel({ name: 'Gare de Lyon', open_hour: '05:00', close_hour: '23:00', image: 'image_url.jpg' });
    await stationA.save();
    await stationB.save();
    stationAId = stationA._id;
    stationBId = stationB._id;
  });

  afterAll(async () => {
    await disconnectDB();
  });



  // ---------------------
  // Récupérer tous les trains
  // ---------------------

  it('Récupérer tous les trains - Réussite', async () => {
    const res = await request(app).get('/train/').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Tous les trains ont été récupérés avec succès');
    expect(res.body.trains).toBeDefined();
  });



  // ---------------------
  // Créer un nouveau train
  // ---------------------

  it('Créer un nouveau train - Réussite pour Admin', async () => {
    const newTrain = { name: 'Train A', start_station: stationAId, end_station: stationBId, time_of_departure: '2024-10-26T10:00:00Z' };

    const res = await request(app).post('/train/create').send(newTrain).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Train enregistré avec succès');
    expect(res.body.train).toBeDefined();
  });

  it('Créer un nouveau train - Accès refusé pour User', async () => {
    const newTrain = { name: 'Train B', start_station: stationAId, end_station: stationBId, time_of_departure: '2024-10-27T15:00:00Z' };

    const res = await request(app).post('/train/create').send(newTrain).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Créer un nouveau train - Accès refusé pour Employee', async () => {
    const newTrain = {
      name: 'Train C', start_station: stationAId, end_station: stationBId, time_of_departure: '2024-10-28T13:00:00Z' 
    };

    const res = await request(app).post('/train/create').send(newTrain).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Créer un nouveau train - Erreur si champs manquants', async () => {
    const newTrain = { name: '' }; // Champs requis manquants
    const res = await request(app).post('/train/create').send(newTrain).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Le nom, les stations de début et de fin ainsi que l\'heure de départ sont requis !');
  });

  it('Créer un nouveau train avec un nom existant - Erreur', async () => {
    const newTrain = { name: 'Train A', start_station: stationAId, end_station: stationBId, time_of_departure: '2024-10-27T15:00:00Z' }; // Ce train a déjà été créé

    const res = await request(app).post('/train/create').send(newTrain).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Le train est déjà existant !');
  });



  // ---------------------
  // Récupérer un train par ID
  // ---------------------

  it('Récupérer un train par ID - Réussite', async () => {
    const train = await TrainModel.findOne({ name: 'Train A' });
    const res = await request(app).get(`/train/${train.id}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Train récupéré avec succès');
    expect(res.body.train).toBeDefined();
  });

  it('Récupérer un train par ID - Train non trouvé', async () => {
    const res = await request(app).get('/train/60f5f8a2b8a245001c09d9c2').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Train non trouvé');
  });



  // ---------------------
  // Mettre à jour un train par ID
  // ---------------------

  it('Mettre à jour un train par ID - Réussite pour Admin', async () => {
    const train = await TrainModel.findOne({ name: 'Train A' });
    const updatedTrain = { name: 'Train A Modifié' };
    const res = await request(app).put(`/train/${train.id}`).send(updatedTrain).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Train mis à jour avec succès');
    expect(res.body.train.name).toBe('Train A Modifié');
  });

  it('Mettre à jour un train par ID - Accès refusé pour User', async () => {
    const train = await TrainModel.findOne({ name: 'Train A Modifié' });
    const updatedTrain = { name: 'Train A' };
    const res = await request(app).put(`/train/${train.id}`).send(updatedTrain).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Mettre à jour un train par ID - Accès refusé pour Employee', async () => {
    const train = await TrainModel.findOne({ name: 'Train A Modifié' });
    const updatedTrain = { name: 'Train A' };
    const res = await request(app).put(`/train/${train.id}`).send(updatedTrain).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Mettre à jour un train par ID - Gare non trouvée', async () => {
    const res = await request(app).put('/train/60f5f8a2b8a245001c09d9c2').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Train non trouvé');
  });



  // ---------------------
  // Supprimer un train par ID
  // ---------------------

  it('Supprimer un train par ID - Accès refusé pour User', async () => {
    const train = await TrainModel.findOne({ name: 'Train A Modifié' });
    const res = await request(app).delete(`/train/${train.id}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Supprimer un train par ID - Accès refusé pour Employee', async () => {
    const train = await TrainModel.findOne({ name: 'Train A Modifié' });
    const res = await request(app).delete(`/train/${train.id}`).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Supprimer un train par ID - Réussite pour Admin', async () => {
    const train = await TrainModel.findOne({ name: 'Train A Modifié' });
    const res = await request(app).delete(`/train/${train.id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});
