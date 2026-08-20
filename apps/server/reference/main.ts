import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { parseAllowedOrigins } from './allowed-origins';
import { ReferenceAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ReferenceAppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: parseAllowedOrigins(
      config.getOrThrow<string>('REFERENCE_ALLOWED_ORIGINS'),
    ),
  });

  await app.listen(config.getOrThrow<number>('REFERENCE_PORT'));
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
