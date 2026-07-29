import { Module } from '@nestjs/common';

import { AuthAccountsController } from './auth-accounts.controller';
import { AuthSessionsController } from './auth-sessions.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthAccountsController, AuthSessionsController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
