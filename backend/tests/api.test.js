import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();

  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI = mongod.getUri();
  process.env.SESSION_SECRET = 'test-secret';
  process.env.CLIENT_URL = 'http://localhost:5173';

  const db = await import('../src/config/db.js');
  await db.connectDb();

  const module = await import('../src/app.js');
  app = module.default;
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

describe('LinkVault API', () => {
  async function registerAgent(agent, email = 'auth@example.com') {
    return agent.post('/api/auth/register').send({
      name: 'Auth User',
      email,
      password: 'StrongPass123!'
    });
  }

  it('allows guest to create default text link', async () => {
    const response = await request(app).post('/api/links').field('text', 'hello from guest');

    expect(response.status).toBe(201);
    expect(response.body.type).toBe('text');
    expect(response.body.token).toBeTruthy();
  });

  it('blocks guest file upload and advanced options', async () => {
    const fileResponse = await request(app)
      .post('/api/links')
      .attach('file', Buffer.from('test-data'), 'sample.txt');

    expect(fileResponse.status).toBe(401);

    const optionsResponse = await request(app)
      .post('/api/links')
      .field('text', 'hello')
      .field('maxViews', '2');

    expect(optionsResponse.status).toBe(401);
  });

  it('registers user with sanitized name', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: '  <b>Test@User</b>  ',
      email: 'TeSt@Example.com',
      password: 'StrongPass123!'
    });

    expect(response.status).toBe(201);
    expect(response.body.user.name).toBe('bTestUserb');
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('allows authenticated user to create file link with custom options', async () => {
    const agent = request.agent(app);

    const reg = await registerAgent(agent);

    expect(reg.status).toBe(201);

    const response = await agent
      .post('/api/links')
      .attach('file', Buffer.from('file-bytes'), 'doc.txt')
      .field('password', 'share-pass')
      .field('maxViews', '3')
      .field('expiresAt', new Date(Date.now() + 20 * 60 * 1000).toISOString());

    expect(response.status).toBe(201);
    expect(response.body.type).toBe('file');
    expect(response.body.maxViews).toBe(3);
    expect(response.body.passwordProtected).toBe(true);
  });

  it('accepts allowed file types', async () => {
    const agent = request.agent(app);
    const reg = await registerAgent(agent, 'allowed@example.com');
    expect(reg.status).toBe(201);

    const response = await agent
      .post('/api/links')
      .attach('file', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: 'image.png',
        contentType: 'image/png'
      })
      .field('expiresAt', new Date(Date.now() + 20 * 60 * 1000).toISOString());

    expect(response.status).toBe(201);
    expect(response.body.type).toBe('file');
  });

  it('rejects unsupported file types with 415', async () => {
    const agent = request.agent(app);
    const reg = await registerAgent(agent, 'blocked@example.com');
    expect(reg.status).toBe(201);

    const response = await agent
      .post('/api/links')
      .attach('file', Buffer.from('MZfake'), {
        filename: 'malware.exe',
        contentType: 'application/x-msdownload'
      })
      .field('expiresAt', new Date(Date.now() + 20 * 60 * 1000).toISOString());

    expect(response.status).toBe(415);
    expect(response.body.message).toBe('Unsupported file type');
  });
});
