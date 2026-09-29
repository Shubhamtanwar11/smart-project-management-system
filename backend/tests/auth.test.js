const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./db');

beforeAll(connect);
afterEach(clearDatabase);
afterAll(closeDatabase);

const user = { name: 'Test User', email: 'test@example.com', password: 'password123' };

describe('Auth', () => {
  test('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  test('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  test('rejects short password', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...user, password: '123' });
    expect(res.status).toBe(400);
  });

  test('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('blocks protected route without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('allows protected route with valid token', async () => {
    const { body } = await request(app).post('/api/auth/register').send(user);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
  });

  test('rejects an invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});
