import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { CreateAuthAccountInput } from '@repo/db/example';

import { AuthService } from './auth.service';

@Controller('auth/accounts')
export class AuthAccountsController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() input: CreateAuthAccountInput) {
    return this.authService.createAccount(input);
  }

  @Get()
  findByUser(@Query('userId') userId: string) {
    return this.authService.findAccountsByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findAccount(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.removeAccount(id);
  }
}
