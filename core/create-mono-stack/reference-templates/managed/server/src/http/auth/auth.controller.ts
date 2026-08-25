import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import type { toNodeHandler } from '@monorepo-template/auth/server';

import { MONOREPO_AUTH_HANDLER } from '../../infra/auth/auth.constants';

type AuthHandler = ReturnType<typeof toNodeHandler>;

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject(MONOREPO_AUTH_HANDLER) private readonly handler: AuthHandler,
  ) {}

  @All('*splat')
  handle(
    @Req() request: Request,
    @Res() response: Response,
  ): void | Promise<void> {
    return this.handler(request, response);
  }
}
