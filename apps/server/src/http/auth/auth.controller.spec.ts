import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  it('forwards the original Node request and response to Better Auth', async () => {
    const request = { method: 'POST' };
    const response = { statusCode: 200 };
    const handler = vi.fn().mockResolvedValue(undefined);
    const controller = new AuthController(handler);

    await controller.handle(request as Request, response as Response);

    expect(handler).toHaveBeenCalledWith(request, response);
  });
});
