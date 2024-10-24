const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const UserModel = require('../models/userModel');

let adminToken, userToken;
let adminId, userId;
let adminRole = 'admin';
let userRole = 'user';

describe('Tests des routes /user', () => {
  
  beforeAll(async () => {
    await connectDB();
  
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
  
    // Créer un admin et un utilisateur régulier
    const adminUser = new UserModel({ pseudo: 'Admin', email: 'admin@example.com', password: adminPassword, role: adminRole });
    const regularUser = new UserModel({ pseudo: 'User', email: 'user@example.com', password: userPassword, role: userRole });
    
    await adminUser.save();
    await regularUser.save();
  
    adminId = adminUser._id;
    userId = regularUser._id;
  
    // Tentative de connexion en tant qu'admin pour récupérer le token
    const adminLoginResponse = await request(app)
      .post('/user/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
  
    console.log('Admin Login Response:', adminLoginResponse.body); // Ajouter un log pour voir la réponse
  
    adminToken = adminLoginResponse.body.token; // Stocker le token de l'admin
  
    // Vérifier si le token est bien défini
    if (!adminToken) {
      console.error('Échec de la récupération du token admin');
    }
  
    const userLoginResponse = await request(app)
      .post('/user/login')
      .send({ email: 'user@example.com', password: 'user123' });
  
    console.log('User Login Response:', userLoginResponse.body); // Ajouter un log pour voir la réponse
  
    userToken = userLoginResponse.body.token; // Stocker le token de l'utilisateur
  
    // Vérifier si le token est bien défini
    if (!userToken) {
      console.error('Échec de la récupération du token utilisateur');
    }
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
  
  it('Connexion réussie et génération d\'un token JWT', async () => {
    const hashedPassword = await bcrypt.hash('Skyzze123', 10);
    const user = new UserModel({ pseudo: 'Skyzze', email: 'Skyzze@gmail.com', password: hashedPassword });
    await user.save();
    console.log(await UserModel.findOne({ email: 'Skyzze@gmail.com' }));
    
    const response = await request(app)
      .post('/user/login')
      .send({ email: 'Skyzze@gmail.com', password: hashedPassword });
  
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Connexion réussie !');
    expect(response.body.token).toBeDefined();
  
    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(user._id.toString());
  });

  it('Récupérer tous les utilisateurs', async () => {
    // Crée des utilisateurs pour le test
    const user1 = new UserModel({ pseudo: 'Skyzze', email: 'Skyzze@gmail.com', password: 'Skyzze123' });
    const user2 = new UserModel({ pseudo: 'Mamba', email: 'Mamba@gmail.com', password: 'Mamba123' });
    await user1.save();
    await user2.save();
  
    // Utiliser le token de l'admin pour effectuer la requête
    const response = await request(app)
      .get('/user/')
      .set('Authorization', `Bearer ${adminToken}`); // Ajouter le token d'authentification
  
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(3); // L'admin, user1, et user2 doivent être présents
    expect(response.body[1].pseudo).toBe('Skyzze');
    expect(response.body[2].pseudo).toBe('Mamba');
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

  

  it('Erreur si le mot de passe est incorrect', async () => {
    const hashedPassword = await bcrypt.hash('Skyzze123', 10);
    const user = new UserModel({ pseudo: 'Skyzze', email: 'Skyzze@gmail.com', password: hashedPassword });
    await user.save();

    const response = await request(app)
      .post('/user/login')
      .send({ email: 'Skyzze@gmail.com', password: 'Skyzze123456789' });

    expect(response.statusCode).toBe(400); // Erreur 400
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

  it('Mettre à jour le rôle d\'un utilisateur avec un rôle valide', async () => {
    const user = new UserModel({ pseudo: 'Skyzze', email: 'Skyzze@gmail.com', password: 'Skyzze123', role: 'user' });
    await user.save();

    // Mise à jour avec un rôle valide
    const response = await request(app)
      .put(`/user/${user._id}/role`)
      .send({ role: 'admin' });

    expect(response.statusCode).toBe(200); // Statut de succès
    expect(response.body).toBe('admin');   // Le rôle doit être 'admin'
  });

  it('Retourne une erreur 400 si le rôle est invalide', async () => {
    // Crée un utilisateur pour le test
    const user = new UserModel({ pseudo: 'Skyzze', email: 'Skyzze@gmail.com', password: 'Skyzze123', role: 'user' });
    await user.save();

    // Rôle invalide (non dans la liste des rôles autorisés)
    const response = await request(app)
      .put(`/user/${user._id}/role`)
      .send({ role: 'superuser' }); // Rôle non autorisé

    expect(response.statusCode).toBe(400); // Statut 400 pour rôle invalide
    expect(response.body.error).toBe('Rôle invalide'); // Message d'erreur attendu
  });
});
