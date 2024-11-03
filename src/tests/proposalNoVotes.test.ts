import request from 'supertest';
import app from '../app.js';

describe('Proposal No Votes API', () => {
  let voteId: number;

  test('Create a new proposal no vote', async () => {
    const response = await request(app)
      .post('/api/proposal-no-votes')
      .send({
        hash: 'uniquehash456',
        toAddress: '0xabcdef1234567890',
        amountSent: 50,
        votesCounted: 5,
        validVote: true,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    voteId = response.body.id;
  });

  test('Retrieve a list of proposal no votes', async () => {
    const response = await request(app).get('/api/proposal-no-votes');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update a proposal no vote', async () => {
    const response = await request(app)
      .put(`/api/proposal-no-votes/${voteId}`)
      .send({
        votesCounted: 8,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.votesCounted).toBe(8);
  });

  test('Delete a proposal no vote', async () => {
    const response = await request(app).delete(`/api/proposal-no-votes/${voteId}`);
    expect(response.statusCode).toBe(204);
  });
}); 