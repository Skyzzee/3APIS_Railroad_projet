const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../app');
const TrainModel = require('../models/trainModel');
const UserModel = require('../models/userModel');
const StationModel = require('../models/stationModel');
const { connectDB, disconnectDB } = require('../config/db');

describe('Tests des routes trains', () => {
    let adminToken, userToken, trainId;

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

        // Création d'un utilisateur régulier
        const userPassword = await bcrypt.hash('user123', 10);
        const regularUser = new UserModel({
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

        const userId = regularUser._id;
        userToken = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });


        const Station1 = new StationModel({ id :'60f5f8a2b8a245001c09b9c2', name: 'Gare A', open_hour: '08:00', close_hour: '20:00', image: 'image_url_a' });
        const Station2 = new StationModel({ id :'60f5f8a2b8a295456c09b9c2', name: 'Gare B', open_hour: '08:00', close_hour: '20:00', image: 'image_url_b' });

        await Station1.save();
        await Station2.save();

        const TrainTest = new TrainModel({id : '60f5f8a2b8a2454166c09b9c2', name: 'Train Test', start_station: '60f5f8a2b8a245001c09b9c2', end_station: '60f5f8a2b8a295456c09b9c2', time_of_departure: '2024-10-22T14:30:00Z'});
        trainId = TrainTest._id;
        await TrainTest.save();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    // Test pour la création d'un train
    it('Enregistrer un nouveau train', async () => {
        const newTrain = {
            name: 'Train A',
            start_station: '60f5f8a2b8a246001c09b9c2',
            end_station: '60f5f8a2b8a295446c09b9c2',
            time_of_departure: '2024-10-23T14:30:00Z'
        };
    
        const response = await request(app)
            .post('/train/create') // Assurez-vous que c'est bien cette route
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newTrain);
    
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Le train a été enregistré avec succès");
    });

    // Test pour la création d'un train existant
    it('Erreur lors de l\'enregistrement d\'un train existant', async () => {
        const duplicateTrain = { name: 'Train A', start_station: '60f5f8a2b8a245001c09b9c2', end_station: '60f5f8a2b8a295456c09b9c2', time_of_departure: '2024-10-22T14:30:00Z' };
        const response = await request(app).post('/train/create').set('Authorization', `Bearer ${adminToken}`).send(duplicateTrain);

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Le train est déjà existant !");
    });

    // Test pour récupérer tous les trains
    it('Récupérer tous les trains', async () => {
        const response = await request(app).get('/train/');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true); // Assurez-vous que la réponse est un tableau
    });

    // Test pour récupérer un train par ID
    it('Récupérer un train par ID', async () => {
        const response = await request(app).get(`/train/${trainId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe('Train Test');
    });

    // Test pour gérer un ID inexistant
    it('Erreur lors de la récupération d\'un train avec un ID inexistant', async () => {
        const response = await request(app).get('/train/60f5f8a2b8a245001c09b9c2');
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Train non trouvé');
    });

    // Test pour mettre à jour un train par ID
    it('Mettre à jour un train par ID', async () => {
        const updatedTrain = { name: 'Train A Updated', start_station: '60f5f8a2b8a245001c09b9c2', end_station: '60f5f8a2b8a295456c09b9c2', time_of_departure: '2024-10-22T14:30:00Z' };
        const response = await request(app).put(`/train/${trainId}`).set('Authorization', `Bearer ${adminToken}`).send(updatedTrain);

        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe('Train A Updated');
    });

    // Test pour gérer la mise à jour si le train n'est pas trouvé
    it('Erreur de mise à jour si le train n\'est pas trouvé', async () => {
        const response = await request(app).put('/train/60f5f8a2b8a245001c09b9c2').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Train Not Found' });
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Train non trouvé');
    });

    // Test pour supprimer un train par ID
    it('Supprimer un train par ID', async () => {
        const response = await request(app).delete(`/train/${trainId}`).set('Authorization', `Bearer ${adminToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Train supprimé avec succès');

        const trainInDb = await TrainModel.findById(trainId);
        expect(trainInDb).toBeNull();
    });

    // Test pour accès sans token sur les routes admin
    it('Erreur d\'accès sans token pour la création d\'un train', async () => {
        const newTrain = { name: 'Train B', start_station: 'Gare D', end_station: 'Gare E', time_of_departure: '12:00' };
        const response = await request(app).post('/train/create').send(newTrain);
        expect(response.statusCode).toBe(403);
    });
});
