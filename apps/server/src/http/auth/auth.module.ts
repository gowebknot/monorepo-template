import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { authHandlerProvider } from '../../infra/auth/auth-handler.provider';

@Module({
  controllers: [AuthController],
  providers: [authHandlerProvider],
})
export class AuthModule {}
