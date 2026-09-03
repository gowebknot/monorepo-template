import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import type { toNodeHandler } from '@monorepo-template/auth/server';

import { MONOREPO_AUTH_HANDLER } from '@/infra/auth/auth.constants';

type AuthHandler = ReturnType<typeof toNodeHandler>;

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject(MONOREPO_AUTH_HANDLER) private readonly handler: AuthHandler,
  ) {}

  @All('*splat')
  @ApiOperation({
    summary: 'Delegate authentication requests to Better Auth',
    description:
      'This server forwards the request unchanged to Better Auth. See the Better Auth API documentation linked from this OpenAPI document for endpoint-specific request and response examples.'
  })
  @ApiResponse({
    status: 200,
    description:
      'Better Auth controls the status code and response body for the delegated endpoint.'
  })
  handle(
    @Req() request: Request,
    @Res() response: Response,
  ): void | Promise<void> {
    return this.handler(request, response);
  }
}
