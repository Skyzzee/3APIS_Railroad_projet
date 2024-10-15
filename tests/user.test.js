const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const UserModel = require('../models/userModel');

describe('Tests des routes /user', () => {
  
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

  it('Récupérer tous les utilisateurs', async () => {
    // Crée des utilisateurs pour le test
    const user1 = new UserModel({ pseudo: 'Skyzze', email: 'Skyzze@gmail.com', password: 'Skyzze123' });
    const user2 = new UserModel({ pseudo: 'Mamba', email: 'Mamba@gmail.com', password: 'Mamba123' });
    await user1.save();
    await user2.save();

    const response = await request(app).get('/user/');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].pseudo).toBe('Skyzze');
    expect(response.body[1].pseudo).toBe('Mamba');
  });

  it('Enregistrer un nouvel utilisateur', async () => {
    const newUser = { pseudo: 'Dova', email: 'Dova@gmail.com', password: 'Dova123' };
    const response = await request(app).post('/user/register').send(newUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("L'utilisateur a été enregistré avec succès");

    // Vérifie que l'utilisateur est bien dans la base de données
    const userInDb = await UserModel.findOne({ pseudo: 'Dova' });
    expect(userInDb).not.toBeNull();
    expect(userInDb.pseudo).toBe('Dova');
  });

  it('Erreur si l’utilisateur existe déjà', async () => {
    const newUser = { pseudo: 'Dova', email: 'Dova@gmail.com', password: 'Dova123' };
    await request(app).post('/user/register').send(newUser); // Crée l'utilisateur une première fois

    const response = await request(app).post('/user/register').send(newUser); // Tente de le créer à nouveau
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("L'utilisateur est déjà existant !");
  });

  it('Connexion d\'un utilisateur', async () => {
    const newUser = { pseudo: 'Skyzze', email: 'Skyzze@gmail.com', password: 'Skyzze123' };
    await request(app).post('/user/register').send(newUser); // Enregistre un utilisateur

    const response = await request(app).post('/user/login').send({ email: 'Skyzze@gmail.com', password: 'Skyzze123' });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Connexion réussie !");
    expect(response.body.user.email).toBe('Skyzze@gmail.com');
  });

  it('Échec de connexion avec des identifiants invalides', async () => {
    const response = await request(app).post('/user/login').send({ email: 'Skyzze@gmail.com', password: 'Skyzze123456789' });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Les informations d'identification sont invalides !");
  });

  it('Récupérer un utilisateur par ID', async () => {
    const newUser = new UserModel({ pseudo: 'Mamba', email: 'Mamba@gmail.com', password: 'Mamba123' });
    await newUser.save();

    const response = await request(app).get(`/user/${newUser._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.pseudo).toBe('Mamba');
  });

  it('Utilisateur non trouvé', async () => {
    const response = await request(app).get('/user/60f5f8a2b8a245001c09d9c2'); // Un ID d'utilisateur qui n'existe pas
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Utilisateur non trouvé');
  });

  it('Modifier un utilisateur par ID', async () => {
    const newUser = new UserModel({ pseudo: 'Dova', email: 'Dova@gmail.com', password: 'Dova123' });
    await newUser.save();

    const response = await request(app).put(`/user/${newUser._id}`).send({ pseudo: 'Yona', email: 'Yona@gmail.com', password: 'Yona123'  });
    expect(response.statusCode).toBe(200);
    expect(response.body.pseudo).toBe('Yona');
  });

  it('Échec si l’utilisateur n’est pas trouvé lors de la mise à jour', async () => {
    const response = await request(app).put('/user/60f5f8a2b8a245001c09d9c2').send({ pseudo: 'Yona' });
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Utilisateur non trouvé');
  });

  it('Supprimer un utilisateur par ID', async () => {
    const newUser = new UserModel({ pseudo: 'Soli', email: 'Soli@gmail.com', password: 'Soli123' });
    await newUser.save();

    const response = await request(app).delete(`/user/${newUser._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.pseudo).toBe('Soli');

    const userInDb = await UserModel.findById(newUser._id);
    expect(userInDb).toBeNull(); // Vérifie que l'utilisateur a bien été supprimé
  });

  it('Échec si l’utilisateur n’est pas trouvé lors de la suppression', async () => {
    const response = await request(app).delete('/user/60f5f8a2b8a245001c09d9c2'); // ID inexistant
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Utilisateur non trouvé');
  });
});
