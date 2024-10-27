const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../app');
const UserModel = require('../models/userModel');
const { connectDB, disconnectDB } = require('../config/db');

describe('Tests des routes utilisateur', () => {
  let adminToken, userToken, employeeToken, adminId, userId, employeeId;

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



  // ===========================
  // Tests pour la récupération des utilisateurs
  // ===========================

  it('Récupérer tous les utilisateurs - Réussite pour Admin', async () => {
    const res = await request(app).get('/user/').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Tous les utilisateurs ont été récupérés avec succès');
    expect(res.body.users).toBeInstanceOf(Array);
  });

  it('Récupérer tous les utilisateurs - Réussite pour Employee', async () => {
    const res = await request(app).get('/user/').set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Tous les utilisateurs ont été récupérés avec succès');
    expect(res.body.users).toBeInstanceOf(Array);
  });

  it('Récupérer tous les utilisateurs - Accès refusé pour User', async () => {
    const res = await request(app).get('/user/').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });



  // ===========================
  // Tests pour l'enregistrement d'un utilisateur
  // ===========================

  it('Enregistrer un nouvel utilisateur', async () => {
    const newUser = { pseudo: 'NewUser', email: 'newuser@gmail.com', password: 'newpassword' };
    const res = await request(app).post('/user/register').send(newUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('L\'utilisateur a été enregistré avec succès');
    
    const userInDb = await UserModel.findOne({ email: 'newuser@gmail.com' });
    expect(userInDb).not.toBeNull();
  });

  it('Erreur lors de l\'enregistrement d\'un utilisateur existant', async () => {
    const adminUser = { pseudo: 'Admin', email: 'admin@gmail.com', password: 'admin123' };
    const res = await request(app).post('/user/register').send(adminUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('L\'utilisateur est déjà existant !');
  });



  // ===========================
  // Tests pour la connexion des utilisateurs
  // ===========================

  it('Connexion utilisateur avec succès', async () => {
    const res = await request(app).post('/user/login').send({ email: 'newuser@gmail.com', password: 'newpassword' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Connexion réussie !');
    expect(res.body.token).toBeDefined();
  });

  it('Erreur de connexion avec un mot de passe incorrect', async () => {
    const res = await request(app).post('/user/login').send({ email: 'admin@gmail.com', password: 'admin123456789' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Le mot de passe est invalide !');
  });

  it('Erreur de connexion avec un utilisateur non trouvé', async () => {
    const res = await request(app).post('/user/login').send({ email: 'notfound@gmail.com', password: 'password' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('L\'email est invalide !');
  });



  // ===========================
  // Tests pour récupération d'un utilisateur par ID
  // ===========================

  it('Récupérer un utilisateur par ID - Réussite pour Admin', async () => {
    const res = await request(app).get(`/user/${userId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Utilisateur récupéré avec succès');
    expect(res.body.user.pseudo).toBe('User');
  });

  it('Récupérer un utilisateur par ID - Accès refusé pour User', async () => {
    const res = await request(app).get(`/user/${employeeId}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Récupérer un utilisateur par ID - Accès refusé pour Employee', async () => {
    const res = await request(app).get(`/user/${userId}`).set('Authorization', `Bearer ${employeeToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });


  
  // ===========================
  // Tests pour la modification du rôle d'un utilisateur
  // ===========================

  it('Mise à jour des informations de l\'utilisateur - Réussite pour Admin', async () => {
    const res = await request(app)
      .put(`/user/${userId}`)
      .send({ pseudo: 'UpdatedUser' })
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Utilisateur mis à jour avec succès');
    expect(res.body.user.pseudo).toBe('UpdatedUser');
  });

  it('Mise à jour ses propres informations  - Réussite pour User', async () => {
    const res = await request(app)
      .put(`/user/${userId}`)
      .send({ pseudo: 'User' })
      .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Utilisateur mis à jour avec succès');
      expect(res.body.user.pseudo).toBe('User');
  });

  it('Mise à jour des informations de l\'utilisateur - Accès refusé pour User', async () => {
    const res = await request(app)
      .put(`/user/${employeeId}`)
      .send({ pseudo: 'User' })
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Mise à jour des informations de l\'utilisateur - Accès refusé pour Employee', async () => {
    const res = await request(app)
      .put(`/user/${userId}`)
      .send({ pseudo: 'User' })
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Erreur de mise à jour si l\'utilisateur n\'est pas trouvé', async () => {
    const res = await request(app).put('/user/60f5f8a2b8a245001c09d9c2').send({ pseudo: 'Yona' }).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Utilisateur non trouvé');
  });


  
  // ===========================
  // Tests pour la modification du rôle d'un utilisateur
  // ===========================

  it('Modification du rôle d\'un utilisateur - Réussite pour Admin', async () => {
    const res = await request(app)
      .put(`/user/${adminId}/role`)
      .send({ role: 'admin' })
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Rôle mis à jour avec succès');
  });

  it('Erreur de modification du rôle - Rôle invalide', async () => {
    const res = await request(app)
      .put(`/user/${userId}/role`)
      .send({ role: 'invalidRole' })
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Rôle invalide');
  });

  it('Modification du rôle d\'un utilisateur - Accès refusé pour User', async () => {
    const res = await request(app)
      .put(`/user/${userId}/role`)
      .send({ role: 'admin' })
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Modification du rôle d\'un utilisateur - Accès refusé pour Employee', async () => {
    const res = await request(app)
      .put(`/user/${userId}/role`)
      .send({ role: 'admin' })
      .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });


  
  // ===========================
  // Tests pour la suppression d'un utilisateur
  // ===========================

  it('Suppression d\'un utilisateur - Accès refusé pour User', async () => {
    const res = await request(app)
    .delete(`/user/${employeeId}`)
    .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });
  
  it('Suppression d\'un utilisateur - Accès refusé pour Employee', async () => {
    const res = await request(app)
    .delete(`/user/${userId}`)
    .set('Authorization', `Bearer ${employeeToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Accès refusé');
  });

  it('Suppression de son propre compte - Réussite pour User', async () => {
    const res = await request(app)
    .delete(`/user/${userId}`)
    .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toBe(204);
  });

  it('Suppression d\'un utilisateur - Réussite pour Admin', async () => {
    const res = await request(app)
      .delete(`/user/${employeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(204);
  });
});
