import { NestFactory } from '@nestjs/core';
import { serverEnv } from '@monorepo-template/env/server';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(serverEnv.PORT);
}
bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
