import request from 'supertest';
import app from '../app.js';

describe('Candidate Wallets API', () => {
  let walletId: number;

  test('Create a new candidate wallet', async () => {
    const response = await request(app)
      .post('/api/candidate-wallets')
      .send({
        address: '0x1234567890abcdef',
        encryptedPrivateKey: 'encryptedKey',
        balance: 1000,
        active: true,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    walletId = response.body.id;
  });

  test('Retrieve a list of candidate wallets', async () => {
    const response = await request(app).get('/api/candidate-wallets');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update a candidate wallet', async () => {
    const response = await request(app)
      .put(`/api/candidate-wallets/${walletId}`)
      .send({
        balance: 2000,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.balance).toBe(2000);
  });

  test('Delete a candidate wallet', async () => {
    const response = await request(app).delete(`/api/candidate-wallets/${walletId}`);
    expect(response.statusCode).toBe(204);
  });
}); 