const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const StationModel = require('../models/stationModel');

describe('Tests des routes /station', () => {
  
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

  it('Récupérer toutes les gares', async () => {
    const station1 = new StationModel({ name: 'Station A', open_hour: '06:00', close_hour: '22:00', image: 'http://example.com/stationA.jpg' });
    const station2 = new StationModel({ name: 'Station B', open_hour: '05:00', close_hour: '02:00', image: 'http://example.com/stationA.jpg' });
    await station1.save();
    await station2.save();

    const response = await request(app).get('/station/');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Station A');
    expect(response.body[1].name).toBe('Station B');
  });

  it('Enregistrer une nouvelle gare', async () => {
    const newstation = { name: 'Station C', open_hour: '06:00', close_hour: '23:00', image:'http://example.com/stationA.jpg' };
    const response = await request(app).post('/station/create').send(newstation);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("La gare a été enregistrée avec succès");

    // Vérifie que le station est bien dans la base de données
    const stationInDb = await StationModel.findOne({ name: 'Station C' });
    expect(stationInDb).not.toBeNull();
    expect(stationInDb.name).toBe('Station C');
  });

  it('Erreur si la gare existe déjà', async () => {
    const newstation = { name: 'Station C', open_hour: '06:00', close_hour: '01:00', image:'http://example.com/stationA.jpg' };
    await request(app).post('/station/create').send(newstation); // Créer le station 

    const response = await request(app).post('/station/create').send(newstation); // Essaie de le recréer
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("La gare est déjà existante !");
  });

  it('Récupérer une gare par ID', async () => {
    const newstation = new StationModel({  name: 'Station D', open_hour: '06:00', close_hour: '23:00', image:'http://example.com/stationA.jpg'  });
    await newstation.save();

    const response = await request(app).get(`/station/${newstation._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Station D');
  });

  it('Gare non trouvée', async () => {
    const response = await request(app).get('/station/60f5f8a2b8a245001c09d9c2'); // Un ID aléatoire
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Gare non trouvée');
  });

  it('Modifier une gare par ID', async () => {
    const newstation = new StationModel({  name: 'Station E', open_hour: '06:00', close_hour: '22:00', image:'http://example.com/stationA.jpg' });
    await newstation.save();

    const response = await request(app).put(`/station/${newstation._id}`).send({ name: 'Station Z' });
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Station Z');
  });

  it('Échec si la gare n’est pas trouvée lors de la mise à jour', async () => {
    const response = await request(app).put('/station/60f5f8a2b8a245001c09d9c2').send({ name: 'Station Z' });
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Gare non trouvée');
  });

  it('Supprimer une gare par ID', async () => {
    const newstation = new StationModel({  name: 'Station F', open_hour: '06:00', close_hour: '21:00', image:'http://example.com/stationA.jpg'  });
    await newstation.save();

    const response = await request(app).delete(`/station/${newstation._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Station F');

    const stationInDb = await StationModel.findById(newstation._id);
    expect(stationInDb).toBeNull(); // Vérifie que le station a bien été supprimé
  });

  it('Échec si la gare n’est pas trouvée lors de la suppression', async () => {
    const response = await request(app).delete('/station/60f5f8a2b8a245001c09d9c2'); // ID inexistant
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Gare non trouvée');
  });
});
