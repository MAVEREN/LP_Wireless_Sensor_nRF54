import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Topology Integration Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/topology/organizations (POST)', () => {
    it('should create a new organization', () => {
      return request(app.getHttpServer())
        .post('/api/topology/organizations')
        .send({
          name: 'Test Org',
          contactEmail: 'test@example.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Org');
        });
    });
  });

  describe('End-to-end hierarchy flow', () => {
    it('should create complete topology hierarchy', async () => {
      // 1. Create organization
      const orgRes = await request(app.getHttpServer())
        .post('/api/topology/organizations')
        .send({
          name: 'E2E Test Org',
          contactEmail: 'e2e@example.com',
        })
        .expect(201);

      const orgId = orgRes.body.id;

      // 2. Create site
      const siteRes = await request(app.getHttpServer())
        .post('/api/topology/sites')
        .send({
          organizationId: orgId,
          name: 'E2E Test Site',
          location: 'Factory Floor 1',
        })
        .expect(201);

      const siteId = siteRes.body.id;

      // 3. Create hub
      const hubRes = await request(app.getHttpServer())
        .post('/api/topology/hubs')
        .send({
          siteId: siteId,
          deviceId: 'hub-e2e-001',
          name: 'E2E Test Hub',
        })
        .expect(201);

      expect(hubRes.body.deviceId).toBe('hub-e2e-001');

      // 4. Create machine
      const machineRes = await request(app.getHttpServer())
        .post('/api/topology/machines')
        .send({
          siteId: siteId,
          name: 'E2E Test Machine',
          type: 'Conveyor',
        })
        .expect(201);

      const machineId = machineRes.body.id;

      // 5. Create node
      const nodeRes = await request(app.getHttpServer())
        .post('/api/topology/nodes')
        .send({
          machineId: machineId,
          deviceId: 'node-e2e-001',
          name: 'E2E Test Node',
          firmwareVersion: '1.0.0',
        })
        .expect(201);

      expect(nodeRes.body.deviceId).toBe('node-e2e-001');
    });
  });
});
