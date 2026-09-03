import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { parseAllowedOrigins } from '@/allowed-origins';
import { AppModule } from '@/app.module';
import { configureSwagger, getSwaggerUrl } from '@/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: parseAllowedOrigins(config.getOrThrow<string>('ALLOWED_ORIGINS')),
  });

  configureSwagger(app);
  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  Logger.log(`Swagger UI: ${getSwaggerUrl(port)}`, 'Bootstrap');
}
bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
