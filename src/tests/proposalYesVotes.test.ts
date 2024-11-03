import request from 'supertest';
import app from '../app.js';

describe('Proposal Yes Votes API', () => {
  let voteId: number;

  test('Create a new proposal yes vote', async () => {
    const response = await request(app)
      .post('/api/proposal-yes-votes')
      .send({
        hash: 'uniquehash123',
        toAddress: '0x1234567890abcdef',
        amountSent: 100,
        votesCounted: 10,
        validVote: true,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    voteId = response.body.id;
  });

  test('Retrieve a list of proposal yes votes', async () => {
    const response = await request(app).get('/api/proposal-yes-votes');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update a proposal yes vote', async () => {
    const response = await request(app)
      .put(`/api/proposal-yes-votes/${voteId}`)
      .send({
        votesCounted: 15,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.votesCounted).toBe(15);
  });

  test('Delete a proposal yes vote', async () => {
    const response = await request(app).delete(`/api/proposal-yes-votes/${voteId}`);
    expect(response.statusCode).toBe(204);
  });
}); 