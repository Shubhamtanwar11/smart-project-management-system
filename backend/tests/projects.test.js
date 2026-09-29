const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./db');

beforeAll(connect);
afterEach(clearDatabase);
afterAll(closeDatabase);

const register = (overrides = {}) =>
  request(app).post('/api/auth/register').send({ name: 'Owner', email: 'owner@example.com', password: 'password123', ...overrides });

describe('Projects', () => {
  test('requires authentication to list or create', async () => {
    expect((await request(app).get('/api/projects')).status).toBe(401);
    expect((await request(app).post('/api/projects').send({ name: 'X' })).status).toBe(401);
  });

  test('requires a name to create a project', async () => {
    const { body } = await register();
    const res = await request(app).post('/api/projects').set('Authorization', `Bearer ${body.token}`).send({ description: 'no name' });
    expect(res.status).toBe(400);
  });

  test('creates and lists only the user\'s own projects', async () => {
    const owner = (await register()).body;
    const other = (await register({ email: 'other@example.com' })).body;
    await request(app).post('/api/projects').set('Authorization', `Bearer ${owner.token}`).send({ name: 'Owner Project' });
    const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${other.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('owner can view, update and delete their project; others cannot', async () => {
    const owner = (await register()).body;
    const other = (await register({ email: 'other2@example.com' })).body;
    const created = await request(app).post('/api/projects').set('Authorization', `Bearer ${owner.token}`).send({ name: 'Alpha' });
    const id = created.body.data._id;

    const getOther = await request(app).get(`/api/projects/${id}`).set('Authorization', `Bearer ${other.token}`);
    expect(getOther.status).toBe(403);

    const updateOther = await request(app).put(`/api/projects/${id}`).set('Authorization', `Bearer ${other.token}`).send({ name: 'Hacked' });
    expect(updateOther.status).toBe(403);

    const updateOwner = await request(app).put(`/api/projects/${id}`).set('Authorization', `Bearer ${owner.token}`).send({ name: 'Beta' });
    expect(updateOwner.status).toBe(200);
    expect(updateOwner.body.data.name).toBe('Beta');

    const deleteOther = await request(app).delete(`/api/projects/${id}`).set('Authorization', `Bearer ${other.token}`);
    expect(deleteOther.status).toBe(403);

    const deleteOwner = await request(app).delete(`/api/projects/${id}`).set('Authorization', `Bearer ${owner.token}`);
    expect(deleteOwner.status).toBe(200);
  });

  test('returns 404 for a non-existent project', async () => {
    const owner = (await register()).body;
    const res = await request(app).get('/api/projects/64b000000000000000000000').set('Authorization', `Bearer ${owner.token}`);
    expect(res.status).toBe(404);
  });
});
