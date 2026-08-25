import { Module } from '@nestjs/common';

import { authHandlerProvider } from '../../infra/auth/auth-handler.provider';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [authHandlerProvider],
})
export class AuthModule {}
