import { Module } from '@nestjs/common';

import { AuthController } from '@/http/auth/auth.controller';
import { authHandlerProvider } from '@/infra/auth/auth-handler.provider';

@Module({
  controllers: [AuthController],
  providers: [authHandlerProvider],
})
export class AuthModule {}
