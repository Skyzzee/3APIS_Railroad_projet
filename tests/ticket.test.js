const request = require('supertest');
const app = require('../app');
const UserModel = require('../models/userModel');
const TicketModel = require('../models/ticketModel');
const TrainModel = require('../models/trainModel');
const StationModel = require('../models/stationModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { connectDB, disconnectDB } = require('../config/db');

describe('Tests des routes des tickets', () => {
  let adminToken, userToken, employeeToken, adminId, userId, employeeId, stationAId, stationBId, trainId;

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

    // Création d'un train
    const train = new TrainModel({ name: 'Train A', start_station: stationAId, end_station: stationBId, time_of_departure: '2024-10-26T10:00:00Z' });
    await train.save();
    trainId = train._id;
  });

  afterAll(async () => {
    await disconnectDB();
  });



  // ---------------------
  // Récupérer tous les tickets d'un utilisateur
  // ---------------------

  it('Récupérer tous les tickets d\'un utilisateur - Réussite', async () => {
    await request(app).post(`/ticket/${trainId}/booking`).set('Authorization', `Bearer ${userToken}`);
    
    const res = await request(app).get('/ticket/history').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Tous les tickets ont été récupérés avec succès');
    expect(res.body.tickets).toBeDefined();
  });

  it('Récupérer tous les tickets d\'un utilisateur - Aucun ticket trouvé', async () => {
    const res = await request(app).get('/ticket/history').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Aucun ticket trouvé pour cet utilisateur');
  });



  // ---------------------
  // Récupérer tous les tickets d’un train
  // ---------------------

  it('Récupérer tous les tickets d’un train - Réussite', async () => {
    await request(app).post(`/ticket/${trainId}/booking`).set('Authorization', `Bearer ${userToken}`);
    
    const res = await request(app).get(`/ticket/${trainId}/available`).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Tous les tickets ont été récupérés avec succès');
    expect(res.body.tickets).toBeDefined();
  });

  it('Récupérer tous les tickets d’un train - Aucun ticket trouvé', async () => {
    const res = await request(app).get('/ticket/60f5f8a2b8a245001c09d9c2/available').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Aucun ticket réservé pour ce train');
  });



  // ---------------------
  // Créer un ticket
  // ---------------------

  it('Créer un ticket - Réussite', async () => {
    const res = await request(app).post(`/ticket/${trainId}/booking`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Le ticket a été réservé avec succès');
    expect(res.body.ticket).toBeDefined();
  });

  it('Créer un ticket - Réussite pour Admin', async () => {
    const res = await request(app).post(`/ticket/${trainId}/booking`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Le ticket a été réservé avec succès');
    expect(res.body.ticket).toBeDefined();
  });

  it('Créer un ticket - Réussite pour Employee', async () => {
    const res = await request(app).post(`/ticket/${trainId}/booking`).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Le ticket a été réservé avec succès');
    expect(res.body.ticket).toBeDefined();
  });



  // ---------------------
  // Récupérer un ticket par ID
  // ---------------------

  it('Récupérer un ticket par ID - Réussite', async () => {
    const ticket = await TicketModel.findOne({ user_id: userId });
    const res = await request(app).get(`/ticket/${ticket._id}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Le ticket à été récupéré avec succès');
    expect(res.body.ticket).toBeDefined();
  });

  it('Récupérer un ticket par ID - Réussite pour Employee', async () => {
    const ticket = await TicketModel.findOne({ user_id: userId });
    const res = await request(app).get(`/ticket/${ticket._id}`).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Le ticket à été récupéré avec succès');
    expect(res.body.ticket).toBeDefined();
  });

  it('Récupérer un ticket par ID - Ticket non trouvé', async () => {
    const res = await request(app).get('/ticket/60f5f8a2b8a245001c09d9c2').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Ticket non trouvé');
  });



  // ---------------------
  // Valider un ticket par ID
  // ---------------------

  it('Valider un ticket par ID - Réussite pour Admin', async () => {
    const ticket = await TicketModel.findOne({ user_id: userId });
    const res = await request(app).get(`/ticket/${ticket._id}/validate`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Ticket validé avec succès');
    expect(res.body.ticket.valid).toBe(true);
  });
  
  it('Valider un ticket par ID - Réussite pour Employee', async () => {
    const ticket = await TicketModel.findOne({ user_id: userId });
    const res = await request(app).get(`/ticket/${ticket._id}/validate`).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Ticket validé avec succès');
    expect(res.body.ticket.valid).toBe(true);
  });

  it('Valider un ticket par ID - Accès refusé pour User', async () => {
    const ticket = await TicketModel.findOne({ user_id: userId });
    const res = await request(app).get(`/ticket/${ticket._id}/validate`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Valider un ticket par ID - Ticket non trouvé', async () => {
    const res = await request(app).get('/ticket/60f5f8a2b8a245001c09d9c2/validate').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Ticket non trouvé');
  });

});
