import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { AuthService } from '#reference/auth/auth.service';

interface CreateAuthSessionBody {
  userId: string;
  token: string;
  expiresAt: string;
}

@Controller('auth/sessions')
export class AuthSessionsController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() body: CreateAuthSessionBody) {
    return this.authService.createSession({
      userId: body.userId,
      token: body.token,
      expiresAt: new Date(body.expiresAt),
    });
  }

  @Get()
  findByUser(@Query('userId') userId: string) {
    return this.authService.findSessionsByUser(userId);
  }

  @Get('token/:token')
  findByToken(@Param('token') token: string) {
    return this.authService.findSessionByToken(token);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.removeSession(id);
  }
}
