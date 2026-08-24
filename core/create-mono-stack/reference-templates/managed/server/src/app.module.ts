import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateServerEnv } from '@monorepo-template/env/server';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
      isGlobal: true,
      validate: (config: Record<string, unknown>) => validateServerEnv(config),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
