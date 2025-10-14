const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  test('POST /api/auth/register should create new user', async () => {
    const userData = {
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      telephone: '+212600000000',
      cin: 'TEST123',
      mot_de_passe: 'password123',
      role: 'partie'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(userData.email);
  });

  test('POST /api/auth/login should authenticate user', async () => {
    const loginData = {
      email: 'test@example.com',
      mot_de_passe: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(loginData.email);
  });
});