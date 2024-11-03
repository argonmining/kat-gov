import request from 'supertest';
import app from '../app.js';

describe('Proposal Nominations API', () => {
  let nominationId: number;

  test('Create a new proposal nomination', async () => {
    const response = await request(app)
      .post('/api/proposal-nominations')
      .send({
        proposalId: 1,
        candidateId: 1,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    nominationId = response.body.id;
  });

  test('Retrieve a list of proposal nominations', async () => {
    const response = await request(app).get('/api/proposal-nominations');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update a proposal nomination', async () => {
    const response = await request(app)
      .put(`/api/proposal-nominations/${nominationId}`)
      .send({
        candidateId: 2,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.candidateId).toBe(2);
  });

  test('Delete a proposal nomination', async () => {
    const response = await request(app).delete(`/api/proposal-nominations/${nominationId}`);
    expect(response.statusCode).toBe(204);
  });
}); 