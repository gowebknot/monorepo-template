import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateServerEnv } from '@monorepo-template/env/server';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './http/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
      isGlobal: true,
      validate: (config: Record<string, unknown>) => validateServerEnv(config),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
