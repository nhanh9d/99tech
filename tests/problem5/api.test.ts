import request from 'supertest';
import { app, startServer } from '../../src/problem5';
import { db } from '../../src/problem5/database/connection';
import { Server } from 'http';

describe('Problem5 API Tests', () => {
  let server: Server;
  let createdResourceId: number;

  beforeAll(async () => {
    server = await startServer();
    // Clean up test data
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM resources', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterAll(async () => {
    // Close server and database
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await new Promise<void>((resolve) => {
      db.close(() => resolve());
    });
  });

  describe('POST /api/resources', () => {
    it('should create a new resource', async () => {
      const resource = {
        name: 'Test Product',
        description: 'Test Description',
        category: 'Test Category',
        price: 99.99,
        quantity: 10,
      };

      const response = await request(app)
        .post('/api/resources')
        .send(resource)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(resource);
      expect(response.body.data.id).toBeDefined();

      createdResourceId = response.body.data.id;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send({
          name: 'Test',
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should validate price is non-negative', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send({
          name: 'Test Product',
          description: 'Test Description',
          category: 'Test Category',
          price: -10,
          quantity: 10,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain(
        'Price is required and must be a non-negative number'
      );
    });
  });

  describe('GET /api/resources', () => {
    it('should list all resources', async () => {
      const response = await request(app).get('/api/resources').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBe(response.body.data.length);
    });

    it('should filter resources by name', async () => {
      const response = await request(app)
        .get('/api/resources?name=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('Test');
    });

    it('should filter resources by price range', async () => {
      const response = await request(app)
        .get('/api/resources?min_price=50&max_price=150')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((resource: any) => {
        expect(resource.price).toBeGreaterThanOrEqual(50);
        expect(resource.price).toBeLessThanOrEqual(150);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/resources?limit=1&offset=0')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/resources/:id', () => {
    it('should get a resource by ID', async () => {
      const response = await request(app)
        .get(`/api/resources/${createdResourceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdResourceId);
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .get('/api/resources/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Resource not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/resources/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid resource ID');
    });
  });

  describe('PUT /api/resources/:id', () => {
    it('should update a resource', async () => {
      const updates = {
        name: 'Updated Product',
        price: 149.99,
      };

      const response = await request(app)
        .put(`/api/resources/${createdResourceId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.price).toBe(updates.price);
    });

    it('should validate update fields', async () => {
      const response = await request(app)
        .put(`/api/resources/${createdResourceId}`)
        .send({
          price: -50,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain(
        'Price must be a non-negative number'
      );
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .put('/api/resources/99999')
        .send({
          name: 'Updated',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/resources/:id', () => {
    it('should delete a resource', async () => {
      const response = await request(app)
        .delete(`/api/resources/${createdResourceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Resource deleted successfully');

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/resources/${createdResourceId}`)
        .expect(404);

      expect(getResponse.body.error).toBe('Resource not found');
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .delete('/api/resources/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Resource not found');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
