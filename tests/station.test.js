const request = require('supertest');
const app = require('../app');
const UserModel = require('../models/userModel');
const StationModel = require('../models/stationModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Tests des routes pour les gares
describe('Tests des routes des gares', () => {
  let adminToken, userToken, employeeToken;

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
  });

  afterAll(async () => {
    await disconnectDB();
  });



  // ==============================
  // Récupérer toutes les gares
  // ==============================

  it('Récupérer toutes les gares - Réussite', async () => {
    const res = await request(app).get('/station/').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Gares récupérées avec succès');
    expect(res.body.stations).toBeDefined();
  });



  // ==============================
  // Créer une nouvelle gare
  // ==============================

  it('Créer une nouvelle gare - Réussite pour Admin', async () => {
    const newStation = { name: 'Gare Dijon', open_hour: '06:00', close_hour: '22:00', image: 'image_url.jpg' };

    const res = await request(app).post('/station/create').send(newStation).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('La gare a été enregistrée avec succès');
    expect(res.body.station).toBeDefined();
  });

  it('Créer une nouvelle gare - Accès refusé pour User', async () => {
    const newStation = { name: 'Gare Lyon', open_hour: '06:00', close_hour: '22:00', image: 'image_url.jpg' };

    const res = await request(app).post('/station/create').send(newStation).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Créer une nouvelle gare - Accès refusé pour Employee', async () => {
    const newStation = { name: 'Gare Lyon', open_hour: '06:00', close_hour: '22:00', image: 'image_url.jpg' };

    const res = await request(app).post('/station/create').send(newStation).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Créer une nouvelle gare - Erreur si champs manquants', async () => {
    const newStation = { name: '' }; // Champs requis manquants
    const res = await request(app).post('/station/create').send(newStation).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Le nom, les heures d\'ouverture et de fermeture ainsi que l\'image sont requis !');
  });



  // ==============================
  // Récupérer une gare par ID
  // ==============================

  it('Récupérer une gare par ID - Réussite', async () => {
    const station = await StationModel.findOne({ name: 'Gare Dijon' });
    const res = await request(app).get(`/station/${station.id}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Gare récupérée avec succès');
    expect(res.body.station).toBeDefined();
  });

  it('Récupérer une gare par ID - Gare non trouvée', async () => {
    const res = await request(app).get('/station/60f5f8a2b8a245001c09d9c2').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Gare non trouvée');
  });



  // ==============================
  // Mettre à jour une gare par ID
  // ==============================

  it('Mettre à jour une gare par ID - Réussite pour Admin', async () => {
    const station = await StationModel.findOne({ name: 'Gare Dijon' });
    const updatedStation = { name: 'Gare Dijon Modifiée' };
    const res = await request(app).put(`/station/${station.id}`).send(updatedStation).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Gare mise à jour avec succès');
    expect(res.body.station.name).toBe('Gare Dijon Modifiée');
  });

  it('Mettre à jour une gare par ID - Accès refusé pour User', async () => {
    const station = await StationModel.findOne({ name: 'Gare Dijon Modifiée' });
    const updatedStation = { name: 'Gare Dijon' };
    const res = await request(app).put(`/station/${station.id}`).send(updatedStation).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Mettre à jour une gare par ID - Accès refusé pour Employee', async () => {
    const station = await StationModel.findOne({ name: 'Gare Dijon Modifiée' });
    const updatedStation = { name: 'Gare Dijon' };
    const res = await request(app).put(`/station/${station.id}`).send(updatedStation).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Mettre à jour une gare par ID - Gare non trouvée', async () => {
    const res = await request(app).put('/station/60f5f8a2b8a245001c09d9c2').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Gare non trouvée');
  });



  // ==============================
  // Supprimer une gare par ID
  // ==============================

  it('Supprimer une gare par ID - Accès refusé pour User', async () => {
    const station = await StationModel.findOne({ name: 'Gare Dijon Modifiée' });
    const res = await request(app).delete(`/station/${station.id}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });
  
  it('Supprimer une gare par ID - Accès refusé pour Employee', async () => {
    const station = await StationModel.findOne({ name: 'Gare Dijon Modifiée' });
    const res = await request(app).delete(`/station/${station.id}`).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Supprimer une gare par ID - Réussite pour Admin', async () => {
    const station = await StationModel.findOne({ name: 'Gare Dijon Modifiée' });
    const res = await request(app).delete(`/station/${station.id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);

    const deletedStation = await StationModel.findById(station.id);
    expect(deletedStation).toBeNull(); // Vérification que la gare a bien été supprimée
  });
  
  it('Supprimer une gare par ID - Gare non trouvée', async () => {
    const res = await request(app).delete('/station/60f5f8a2b8a245001c09d9c2').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Gare non trouvée');
  });
});
