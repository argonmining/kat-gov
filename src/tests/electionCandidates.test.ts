import request from 'supertest';
import app from '../app.js';

describe('Election Candidates API', () => {
  let candidateId: number;

  test('Create a new election candidate', async () => {
    const response = await request(app)
      .post('/api/election-candidates')
      .send({
        name: 'John Doe',
        twitter: '@johndoe',
        discord: 'johndoe#1234',
        telegram: '@johndoe',
        data: Buffer.from('candidate data'),
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    candidateId = response.body.id;
  });

  test('Retrieve a list of election candidates', async () => {
    const response = await request(app).get('/api/election-candidates');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update an election candidate', async () => {
    const response = await request(app)
      .put(`/api/election-candidates/${candidateId}`)
      .send({
        name: 'Jane Doe',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Jane Doe');
  });

  test('Delete an election candidate', async () => {
    const response = await request(app).delete(`/api/election-candidates/${candidateId}`);
    expect(response.statusCode).toBe(204);
  });
}); 