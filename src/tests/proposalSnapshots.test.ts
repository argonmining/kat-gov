import request from 'supertest';
import app from '../app.js';

describe('Proposal Snapshots API', () => {
  let snapshotId: number;

  test('Create a new proposal snapshot', async () => {
    const response = await request(app)
      .post('/api/proposal-snapshots')
      .send({
        proposalId: 1,
        data: { key: 'value' },
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    snapshotId = response.body.id;
  });

  test('Retrieve a list of proposal snapshots', async () => {
    const response = await request(app).get('/api/proposal-snapshots');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update a proposal snapshot', async () => {
    const response = await request(app)
      .put(`/api/proposal-snapshots/${snapshotId}`)
      .send({
        data: { key: 'new value' },
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data.key).toBe('new value');
  });

  test('Delete a proposal snapshot', async () => {
    const response = await request(app).delete(`/api/proposal-snapshots/${snapshotId}`);
    expect(response.statusCode).toBe(204);
  });
}); 