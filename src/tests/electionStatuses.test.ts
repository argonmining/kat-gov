import request from 'supertest';
import app from '../app.js';

describe('Election Statuses API', () => {
  let statusId: number;

  test('Create a new election status', async () => {
    const response = await request(app)
      .post('/api/election-statuses')
      .send({
        name: 'Open',
        active: true,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    statusId = response.body.id;
  });

  test('Retrieve a list of election statuses', async () => {
    const response = await request(app).get('/api/election-statuses');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update an election status', async () => {
    const response = await request(app)
      .put(`/api/election-statuses/${statusId}`)
      .send({
        name: 'Closed',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Closed');
  });

  test('Delete an election status', async () => {
    const response = await request(app).delete(`/api/election-statuses/${statusId}`);
    expect(response.statusCode).toBe(204);
  });
}); 