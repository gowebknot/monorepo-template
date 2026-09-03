import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Response } from 'express';
import request from 'supertest';
import { App } from 'supertest/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppModule } from '@/app.module';
import { MONOREPO_AUTH_HANDLER } from '@/infra/auth/auth.constants';
import { configureSwagger } from '@/swagger';

type SwaggerDocument = {
  openapi: string;
  paths: Record<
    string,
    {
      get: {
        summary: string;
        responses: Record<
          string,
          {
            description: string;
            content: Record<
              string,
              { examples: Record<string, { value: unknown }> }
            >;
          }
        >;
      };
    }
  >;
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });
    moduleBuilder
      .overrideProvider(MONOREPO_AUTH_HANDLER)
      .useValue(
        vi.fn((_request: unknown, response: Response) => {
          response.status(200).json({ session: null });
        }),
      );
    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    configureSwagger(app);
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('TEST-SWAGGER-001 /api/docs-json (GET) describes the health response', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);

    const document = response.body as SwaggerDocument;

    expect(document.openapi).toMatch(/^3\./);
    expect(document.paths['/health'].get.summary).toBe('Check server health');
    expect(document.paths['/health'].get.responses['200'].description).toContain(
      'ready'
    );
    expect(document.paths['/health'].get.responses['200'].content[
      'application/json'
    ].examples.ready.value).toEqual({ status: 'ok' });
  });

  it('/api/auth/get-session (GET) forwards to the auth handler', () => {
    return request(app.getHttpServer())
      .get('/api/auth/get-session')
      .expect(200)
      .expect({ session: null });
  });

  afterEach(async () => {
    await app.close();
  });
});
