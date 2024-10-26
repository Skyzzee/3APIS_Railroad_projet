const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../app');
const UserModel = require('../models/userModel');
const { connectDB, disconnectDB } = require('../config/db');


describe('Tests des routes utilisateur', () => {
  let adminToken, userToken, adminId, userId;

  beforeAll(async () => {
    await connectDB();

    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const adminUser = new UserModel({ pseudo: 'Admin', email: 'admin@example.com', password: adminPassword, role: 'admin' });
    const regularUser = new UserModel({ pseudo: 'User', email: 'user@example.com', password: userPassword, role: 'user' });
    
    await adminUser.save();
    await regularUser.save();

    adminId = adminUser._id;
    userId = regularUser._id;

    adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // Test pour getAllUsers
  it('Récupérer tous les utilisateurs', async () => {
    const response = await request(app).get('/user/').set('Authorization', `Bearer ${adminToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2); // Admin et regular user créés en beforeAll
  });

  // Test pour registerUser
  it('Enregistrer un nouvel utilisateur', async () => {
    const newUser = { pseudo: 'NewUser', email: 'newuser@example.com', password: 'newpassword' };
    const response = await request(app).post('/user/register').send(newUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("L'utilisateur a été enregistré avec succès");
    const userInDb = await UserModel.findOne({ email: 'newuser@example.com' });
    expect(userInDb).not.toBeNull();
  });

  it('Erreur lors de l\'enregistrement d\'un utilisateur existant', async () => {
    const newUser = { pseudo: 'Admin', email: 'admin@example.com', password: 'admin123' };
    const response = await request(app).post('/user/register').send(newUser);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("L'utilisateur est déjà existant !");
  });

  // Test pour loginUser
  it('Connexion utilisateur avec succès', async () => {
    const response = await request(app).post('/user/login').send({ email: 'newuser@example.com', password: 'newpassword' });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Connexion réussie !');
    expect(response.body.token).toBeDefined();
  });

  it('Erreur de connexion avec un mot de passe incorrect', async () => {
    const response = await request(app).post('/user/login').send({ email: 'admin@example.com', password: 'wrongpassword' });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Le mot de passe est invalide !');
  });

  // Test pour getUserById
  it('Récupérer un utilisateur par ID', async () => {
    const response = await request(app).get(`/user/${userId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.pseudo).toBe('User');
  });

  it('Erreur lors de la récupération d\'un utilisateur avec un ID inexistant', async () => {
    const response = await request(app).get('/user/60f5f8a2b8a245001c09d9c2').set('Authorization', `Bearer ${adminToken}`);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Utilisateur non trouvé');
  });

  // Test pour updateUserById
  it('Mise à jour des informations de l\'utilisateur', async () => {
    const response = await request(app)
      .put(`/user/${userId}`)
      .send({ pseudo: 'User' })
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.pseudo).toBe('User');
  });

  it('Erreur de mise à jour si l\'utilisateur n\'est pas trouvé', async () => {
    const response = await request(app).put('/user/60f5f8a2b8a245001c09d9c2').send({ pseudo: 'Yona' }).set('Authorization', `Bearer ${adminToken}`);
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Utilisateur non trouvé');
  });

  
  // Test pour editRoleUser
  it('Modification du rôle d\'un utilisateur', async () => {
    const response = await request(app)
    .put(`/user/${userId}/role`)
    .send({ role: 'admin' })
    .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Rôle mis à jour avec succès');
    expect(response.body.role).toBe('admin');
  });
  
  it('Erreur si le rôle est invalide', async () => {
    const response = await request(app)
    .put(`/user/${userId}/role`)
    .send({ role: 'superuser' })
    .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Rôle invalide');
  });

  // Test pour deleteUserById
  it('Suppression d\'un utilisateur par ID', async () => {
    const response = await request(app).delete(`/user/${userId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Utilisateur supprimé avec succès');
  
    const userInDb = await UserModel.findById(userId);
    expect(userInDb).toBeNull();
  });
});
