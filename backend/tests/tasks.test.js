const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./db');

beforeAll(connect);
afterEach(clearDatabase);
afterAll(closeDatabase);

const register = (email) => request(app).post('/api/auth/register').send({ name: 'User', email, password: 'password123' });

async function setup() {
  const owner = (await register('owner@example.com')).body;
  const outsider = (await register('outsider@example.com')).body;
  const project = (await request(app).post('/api/projects').set('Authorization', `Bearer ${owner.token}`).send({ name: 'Proj' })).body.data;
  return { owner, outsider, project };
}

describe('Tasks', () => {
  test('requires title and project to create', async () => {
    const { owner, project } = await setup();
    const noTitle = await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`).send({ project: project._id });
    expect(noTitle.status).toBe(400);
    const noProject = await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`).send({ title: 'Task' });
    expect(noProject.status).toBe(400);
  });

  test('creates a task in an owned project', async () => {
    const { owner, project } = await setup();
    const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`).send({ title: 'Design homepage', project: project._id, priority: 'high' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Design homepage');
  });

  test('blocks creating a task in a project the user cannot access', async () => {
    const { outsider, project } = await setup();
    const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${outsider.token}`).send({ title: 'Sneaky', project: project._id });
    expect(res.status).toBe(403);
  });

  test('rejects assigning a task to a non-member', async () => {
    const { owner, project } = await setup();
    const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Task', project: project._id, assignedTo: '64b000000000000000000000' });
    expect(res.status).toBe(400);
  });

  test('updates task status and deletes a task', async () => {
    const { owner, project } = await setup();
    const created = (await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`).send({ title: 'Task', project: project._id })).body.data;
    const updated = await request(app).put(`/api/tasks/${created._id}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'completed' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe('completed');
    const deleted = await request(app).delete(`/api/tasks/${created._id}`).set('Authorization', `Bearer ${owner.token}`);
    expect(deleted.status).toBe(200);
  });

  test('outsider cannot view, update or delete a task in a project they are not part of', async () => {
    const { owner, outsider, project } = await setup();
    const created = (await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`).send({ title: 'Task', project: project._id })).body.data;
    expect((await request(app).get(`/api/tasks/${created._id}`).set('Authorization', `Bearer ${outsider.token}`)).status).toBe(403);
    expect((await request(app).put(`/api/tasks/${created._id}`).set('Authorization', `Bearer ${outsider.token}`).send({ status: 'completed' })).status).toBe(403);
    expect((await request(app).delete(`/api/tasks/${created._id}`).set('Authorization', `Bearer ${outsider.token}`)).status).toBe(403);
  });

  test('reports dashboard stats for the authenticated user only', async () => {
    const { owner, project } = await setup();
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`).send({ title: 'A', project: project._id, status: 'completed' });
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${owner.token}`).send({ title: 'B', project: project._id });
    const res = await request(app).get('/api/tasks/stats').set('Authorization', `Bearer ${owner.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalTasks).toBe(2);
    expect(res.body.data.completedTasks).toBe(1);
  });
});
