// Set test database before any imports
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgres://localhost:5432/minicampaign_test';

import request from 'supertest';
import app from '../src/app';
import { testDb, truncateAll } from './setup';

let agent: ReturnType<typeof request.agent>;

// Migrations are run by the pretest script (see package.json)

afterAll(async () => {
  await testDb.destroy();
});

beforeEach(async () => {
  await truncateAll();
  agent = request.agent(app);
});

describe('Campaign Integration Tests', () => {
  const registerAndLogin = async () => {
    const res = await agent
      .post('/api/auth/register')
      .send({ email: 'test@test.com', name: 'Tester', password: 'password123' });
    expect(res.status).toBe(201);
    return res;
  };

  const createCampaign = async (overrides = {}) => {
    const res = await agent
      .post('/api/campaigns')
      .send({
        name: 'Test Campaign',
        subject: 'Hello',
        body: 'World',
        recipientEmails: ['a@b.com', 'c@d.com', 'e@f.com'],
        ...overrides,
      });
    expect(res.status).toBe(201);
    return res.body.campaign;
  };

  // Test 1: Draft-only editing
  test('cannot edit or delete a non-draft campaign', async () => {
    await registerAndLogin();
    const campaign = await createCampaign();

    const scheduleRes = await agent
      .post(`/api/campaigns/${campaign.id}/schedule`)
      .send({ scheduledAt: '2030-12-25T10:00:00.000Z' });
    expect(scheduleRes.status).toBe(200);
    expect(scheduleRes.body.campaign.status).toBe('scheduled');

    const editRes = await agent
      .patch(`/api/campaigns/${campaign.id}`)
      .send({ name: 'New Name' });
    expect(editRes.status).toBe(400);
    expect(editRes.body.error.code).toBe('CAMPAIGN_NOT_DRAFT');

    const deleteRes = await agent.delete(`/api/campaigns/${campaign.id}`);
    expect(deleteRes.status).toBe(400);
    expect(deleteRes.body.error.code).toBe('CAMPAIGN_NOT_DRAFT');
  });

  // Test 2: Schedule validation
  test('schedule requires a future date', async () => {
    await registerAndLogin();
    const campaign = await createCampaign();

    const pastRes = await agent
      .post(`/api/campaigns/${campaign.id}/schedule`)
      .send({ scheduledAt: '2020-01-01T00:00:00.000Z' });
    expect(pastRes.status).toBe(400);
    expect(pastRes.body.error.code).toBe('INVALID_SCHEDULE');

    const futureRes = await agent
      .post(`/api/campaigns/${campaign.id}/schedule`)
      .send({ scheduledAt: '2030-06-15T12:00:00.000Z' });
    expect(futureRes.status).toBe(200);
    expect(futureRes.body.campaign.status).toBe('scheduled');
  });

  // Test 3: Send simulation
  test('sending marks campaign and all recipients as sent', async () => {
    await registerAndLogin();
    const campaign = await createCampaign();

    const sendRes = await agent.post(`/api/campaigns/${campaign.id}/send`);
    expect(sendRes.status).toBe(200);
    expect(sendRes.body.campaign.status).toBe('sent');

    const detailRes = await agent.get(`/api/campaigns/${campaign.id}`);
    const recipients = detailRes.body.campaign.recipients;
    expect(recipients).toHaveLength(3);
    recipients.forEach((r: any) => {
      expect(r.status).toBe('sent');
      expect(r.sent_at).not.toBeNull();
    });

    const resendRes = await agent.post(`/api/campaigns/${campaign.id}/send`);
    expect(resendRes.status).toBe(400);
    expect(resendRes.body.error.code).toBe('ALREADY_SENT');
  });

  // Test 4: Stats accuracy
  test('stats returns correct counts and rates', async () => {
    await registerAndLogin();
    const campaign = await createCampaign({
      recipientEmails: ['a@b.com', 'c@d.com', 'e@f.com', 'g@h.com', 'i@j.com'],
    });

    await agent.post(`/api/campaigns/${campaign.id}/send`);

    const recipients = await testDb('campaign_recipients')
      .where({ campaign_id: campaign.id });

    // Mark 1 as failed, 2 as opened
    await testDb('campaign_recipients')
      .where({ campaign_id: campaign.id, recipient_id: recipients[0].recipient_id })
      .update({ status: 'failed', sent_at: null });
    await testDb('campaign_recipients')
      .where({ campaign_id: campaign.id, recipient_id: recipients[1].recipient_id })
      .update({ opened_at: new Date() });
    await testDb('campaign_recipients')
      .where({ campaign_id: campaign.id, recipient_id: recipients[2].recipient_id })
      .update({ opened_at: new Date() });

    const statsRes = await agent.get(`/api/campaigns/${campaign.id}/stats`);
    expect(statsRes.status).toBe(200);
    const { stats } = statsRes.body;
    expect(stats.total).toBe(5);
    expect(stats.sent).toBe(4);
    expect(stats.failed).toBe(1);
    expect(stats.opened).toBe(2);
    expect(stats.open_rate).toBe(0.4);
    expect(stats.send_rate).toBe(0.8);
  });

  // Test 5: Full lifecycle
  test('full lifecycle: create → edit → schedule → send → stats → immutable', async () => {
    await registerAndLogin();

    const campaign = await createCampaign();
    expect(campaign.status).toBe('draft');

    const editRes = await agent
      .patch(`/api/campaigns/${campaign.id}`)
      .send({ name: 'Updated' });
    expect(editRes.status).toBe(200);
    expect(editRes.body.campaign.name).toBe('Updated');

    await agent
      .post(`/api/campaigns/${campaign.id}/schedule`)
      .send({ scheduledAt: '2030-12-25T10:00:00.000Z' });

    const sendRes = await agent.post(`/api/campaigns/${campaign.id}/send`);
    expect(sendRes.body.campaign.status).toBe('sent');

    const statsRes = await agent.get(`/api/campaigns/${campaign.id}/stats`);
    expect(statsRes.body.stats.total).toBe(3);
    expect(statsRes.body.stats.sent).toBe(3);
    expect(statsRes.body.stats.send_rate).toBe(1);

    const postEditRes = await agent
      .patch(`/api/campaigns/${campaign.id}`)
      .send({ name: 'Nope' });
    expect(postEditRes.status).toBe(400);
  });
});
