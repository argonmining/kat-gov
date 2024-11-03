import request from 'supertest';
import app from '../app.js';

describe('Candidate Nominations API', () => {
  let nominationId: number;

  test('Create a new candidate nomination', async () => {
    const response = await request(app)
      .post('/api/candidate-nominations')
      .send({
        candidateId: 1,
        electionId: 1,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    nominationId = response.body.id;
  });

  test('Retrieve a list of candidate nominations', async () => {
    const response = await request(app).get('/api/candidate-nominations');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update a candidate nomination', async () => {
    const response = await request(app)
      .put(`/api/candidate-nominations/${nominationId}`)
      .send({
        electionId: 2,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.electionId).toBe(2);
  });

  test('Delete a candidate nomination', async () => {
    const response = await request(app).delete(`/api/candidate-nominations/${nominationId}`);
    expect(response.statusCode).toBe(204);
  });
}); 