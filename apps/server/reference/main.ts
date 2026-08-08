import { NestFactory } from '@nestjs/core';
import { referenceServerEnv } from '@repo/env/reference-server';

import { ReferenceAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ReferenceAppModule);

  const allowedOrigins = referenceServerEnv.REFERENCE_ALLOWED_ORIGINS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  });

  await app.listen(referenceServerEnv.REFERENCE_PORT);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
