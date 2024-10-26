const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../app');
const mongoose = require('mongoose');
const StationModel = require('../models/stationModel');
const UserModel = require('../models/userModel');
const TrainModel = require('../models/trainModel');
const TicketModel = require('../models/ticketModel');
const { connectDB, disconnectDB } = require('../config/db');


describe('Tests des routes tickets', () => {
  let userToken;
  let adminToken;
  let trainId;
  let ticketId;
  let userId;

  beforeAll(async () => {
    await connectDB();

    // Création d'un utilisateur admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new UserModel({
        id: '60f5f8a2b8a245451c09b9c2',
        pseudo: 'Admin',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin'
    });

    // Création d'un utilisateur régulier
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = new UserModel({
        id: '60f5f8a2b8a245478c09b9c2',
        pseudo: 'User',
        email: 'user@example.com',
        password: userPassword,
        role: 'user'
    });

    await adminUser.save();
    await regularUser.save();

    // Génération des tokens
    const adminId = adminUser._id;
    adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    userId = regularUser._id;
    userToken = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });


    const Station1 = new StationModel({ id :'60f5f8a2b8a245001c09b9c2', name: 'Gare A', open_hour: '08:00', close_hour: '20:00', image: 'image_url_a' });
    const Station2 = new StationModel({ id :'60f5f8a2b8a295456c09b9c2', name: 'Gare B', open_hour: '08:00', close_hour: '20:00', image: 'image_url_b' });

    await Station1.save();
    await Station2.save();

    const TrainTest = new TrainModel({id: new mongoose.Types.ObjectId('60f5f8a2b8a295456c09b9c5'), name: 'Train Test', start_station: '60f5f8a2b8a245001c09b9c2', end_station: '60f5f8a2b8a295456c09b9c2', time_of_departure: '2024-10-22T14:30:00Z'});
    await TrainTest.save();
    trainId = TrainTest.id;
    });

  afterAll(async () => {
    await disconnectDB();
  });

  it('Enregistrer un nouveau ticket', async () => {
    const response = await request(app)
      .post(`/ticket/${trainId}/booking`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Le ticket a été réservé avec succès");
  });

  it("Récupérer tous les tickets d'un utilisateur (historique)", async () => {
    const response = await request(app)
      .get('/ticket/history')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("Récupérer tous les tickets pour un train donné", async () => {
    const response = await request(app)
      .get(`/ticket/${trainId}/available`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("Récupérer un ticket par ID", async () => {
    const ticketInDb = await TicketModel.findOne({ user_id: userId, train_id: trainId });
    expect(ticketInDb).not.toBeNull(); // Vérifie que le ticket existe
    ticketId = ticketInDb._id;

    const response = await request(app)
      .get(`/ticket/${ticketId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(ticketId.toString()); // Utilisez toString() pour comparer les ID
    
  });

  it('Valider un ticket par ID', async () => {
    const response = await request(app)
    .get(`/ticket/${ticketId}/validate`)
    .set('Authorization', `Bearer ${adminToken}`);
  
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Ticket validé avec succès');
    expect(response.body.ticket.valid).toBe(true);
  });

  it('Empêche la validation du ticket pour un utilisateur sans droits administratifs', async () => {
    const response = await request(app)
    .get(`/ticket/${ticketId}/validate`)
    .set('Authorization', `Bearer ${userToken}`);
  
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Accès refusé');
  });
});
