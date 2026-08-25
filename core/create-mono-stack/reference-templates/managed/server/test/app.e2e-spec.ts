import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Response } from 'express';
import request from 'supertest';
import { App } from 'supertest/types';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';

import { AppModule } from './../src/app.module';
import { MONOREPO_AUTH_HANDLER } from './../src/infra/auth/auth.constants';

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
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('Hello World!');
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
