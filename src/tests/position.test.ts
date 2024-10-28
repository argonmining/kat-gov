import request from 'supertest';
import app from '../app.js';

describe('Positions API', () => {
  let positionId: number;

  test('Create a new position', async () => {
    const response = await request(app)
      .post('/api/positions')
      .send({
        title: 'Test Position',
        filled: false,
        elect: true,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    positionId = response.body.id;
  });

  test('Retrieve a list of positions', async () => {
    const response = await request(app).get('/api/positions');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update a position', async () => {
    const response = await request(app)
      .put(`/api/positions/${positionId}`)
      .send({
        title: 'Updated Test Position',
        filled: true,
        elect: false,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe('Updated Test Position');
  });

  test('Delete a position', async () => {
    const response = await request(app).delete(`/api/positions/${positionId}`);
    expect(response.statusCode).toBe(204);
  });
});
