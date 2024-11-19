import request from 'supertest';
import app from '../app.js'; // Import your Express app

describe('Proposals API', () => {
  let proposalId: number;

  test('Create a new proposal', async () => {
    const response = await request(app)
      .post('/api/proposals')
      .send({
        title: 'Test Proposal',
        description: 'Test Subtitle',
        body: 'Test Body',
        type: 1,
        approved: false,
        reviewed: false,
        status: 1,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    proposalId = response.body.id;
  });

  test('Retrieve a list of proposals', async () => {
    const response = await request(app).get('/api/proposals');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update a proposal', async () => {
    const response = await request(app)
      .put(`/api/proposals/${proposalId}`)
      .send({
        title: 'Updated Test Proposal',
        description: 'Updated Test Subtitle',
        body: 'Updated Test Body',
        type: 1,
        approved: true,
        reviewed: true,
        status: 2,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe('Updated Test Proposal');
  });

  test('Delete a proposal', async () => {
    const response = await request(app).delete(`/api/proposals/${proposalId}`);
    expect(response.statusCode).toBe(204);
  });
});
