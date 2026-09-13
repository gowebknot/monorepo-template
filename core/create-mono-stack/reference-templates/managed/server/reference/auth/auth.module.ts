import { Module } from '@nestjs/common';

import { AuthAccountsController } from '#reference/auth/auth-accounts.controller';
import { AuthSessionsController } from '#reference/auth/auth-sessions.controller';
import { AuthService } from '#reference/auth/auth.service';

@Module({
  controllers: [AuthAccountsController, AuthSessionsController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
