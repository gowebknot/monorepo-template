import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { parseAllowedOrigins } from './allowed-origins';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: parseAllowedOrigins(config.getOrThrow<string>('ALLOWED_ORIGINS')),
  });

  await app.listen(config.getOrThrow<number>('PORT'));
}
bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
