import request from 'supertest';
import app from '../app.js';

describe('Election Positions API', () => {
  let positionId: number;

  test('Create a new election position', async () => {
    const response = await request(app)
      .post('/api/election-positions')
      .send({
        name: 'President',
        description: 'Leader of the organization',
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    positionId = response.body.id;
  });

  test('Retrieve a list of election positions', async () => {
    const response = await request(app).get('/api/election-positions');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update an election position', async () => {
    const response = await request(app)
      .put(`/api/election-positions/${positionId}`)
      .send({
        description: 'Updated description',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.description).toBe('Updated description');
  });

  test('Delete an election position', async () => {
    const response = await request(app).delete(`/api/election-positions/${positionId}`);
    expect(response.statusCode).toBe(204);
  });
}); 