import request from 'supertest';
import app from '../app.js';

describe('Elections API', () => {
  let electionId: number;

  test('Create a new election', async () => {
    const response = await request(app)
      .post('/api/elections')
      .send({
        title: 'Test Election',
        position: 1,
        status: 1,
        submitdate: new Date().toISOString(),
        openvote: new Date().toISOString(),
        snapshot: new Date().toISOString(),
        closevote: new Date().toISOString(),
        winner: null,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    electionId = response.body.id;
  });

  test('Retrieve a list of elections', async () => {
    const response = await request(app).get('/api/elections');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Delete an election', async () => {
    const response = await request(app).delete(`/api/elections/${electionId}`);
    expect(response.statusCode).toBe(204);
  });
});
