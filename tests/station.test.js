const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../app');
const StationModel = require('../models/stationModel');
const UserModel = require('../models/userModel');
const { connectDB, disconnectDB } = require('../config/db');

describe('Tests des routes gares', () => {
  let adminToken, stationId;

  beforeAll(async () => {
    await connectDB();

    // Création d'un utilisateur admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new UserModel({
      pseudo: 'Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = new UserModel({
      pseudo: 'User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user'
    });
    
    await adminUser.save();
    await regularUser.save();
    
    // Génération d'un token pour l'utilisateur admin
    const adminId = adminUser._id;
    adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const userId = regularUser._id;
    userToken = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  
    // Test pour creationStation
    it('Enregistrer une nouvelle gare', async () => {
      const newStation = { name: 'Gare A', open_hour: '08:00', close_hour: '20:00', image: 'image_url_a' };
      const response = await request(app).post('/station/create').set('Authorization', `Bearer ${adminToken}`).send(newStation);
      
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("La gare a été enregistrée avec succès");
      
      // Vérifiez que la gare est enregistrée dans la base de données
      const stationInDb = await StationModel.findOne({ name: 'Gare A' });
      expect(stationInDb).not.toBeNull();
      stationId = stationInDb._id;
    });
    
    it('Erreur lors de l\'enregistrement d\'une gare existante', async () => {
        const duplicateStation = { name: 'Gare A', open_hour: '09:00', close_hour: '21:00', image: 'image_url_b' };
        const response = await request(app).post('/station/create').set('Authorization', `Bearer ${adminToken}`).send(duplicateStation);
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("La gare est déjà existante !");
    });

    // Test pour getAllStation
    it('Récupérer toutes les gares', async () => {
        const response = await request(app).get('/station/');
        expect(response.statusCode).toBe(200);
    });

    // Test pour getStationById
    it('Récupérer une gare par ID', async () => {
        const response = await request(app).get(`/station/${stationId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe('Gare A');
    });

    it('Erreur lors de la récupération d\'une gare avec un ID inexistant', async () => {
        const response = await request(app).get('/station/60f5f8a2b8a245001c09b9c2');
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Gare non trouvée');
    });


    // Test pour updateStationById
    it('Mettre à jour une gare par ID', async () => {
        const updatedStation = { name: 'Gare A Updated', open_hour: '09:00', close_hour: '19:00', image: 'image_url_updated' };
        const response = await request(app).put(`/station/${stationId}`).set('Authorization', `Bearer ${adminToken}`).send(updatedStation);

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe('Gare A Updated');
    });

    it('Erreur de mise à jour si la gare n\'est pas trouvée', async () => {
        const response = await request(app).put('/station/60f5f8a2b8a245001c09d9c2').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Gare Not Found' });
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Gare non trouvée');
    });

    // Test pour deleteStationById
    it('Supprimer une gare par ID', async () => {
        const response = await request(app).delete(`/station/${stationId}`).set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Gare et trains associés supprimés avec succès');

        const stationInDb = await StationModel.findById(stationId);
        expect(stationInDb).toBeNull();
    });

    // Test pour accès sans token sur les routes admin
    it('Erreur d\'accès sans token pour la création d\'une gare', async () => {
        const newStation = { name: 'Gare B', open_hour: '10:00', close_hour: '22:00', image: 'image_url_b' };
        const response = await request(app).post('/station/create').send(newStation);
        expect(response.statusCode).toBe(403);
    });
});
