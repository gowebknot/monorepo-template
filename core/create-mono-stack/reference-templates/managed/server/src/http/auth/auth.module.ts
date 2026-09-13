import { Module } from '@nestjs/common';

import { authHandlerProvider } from '@/infra/auth/auth-handler.provider';
import { AuthController } from '@/http/auth/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [authHandlerProvider],
})
export class AuthModule {}
