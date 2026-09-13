import { Module } from '@nestjs/common';

import { UsersController } from '#reference/users/users.controller';
import { UsersService } from '#reference/users/users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
