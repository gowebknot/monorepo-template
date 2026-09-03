import { describe, expect, it } from 'vitest';

import { getSwaggerUrl } from '@/swagger';

describe('getSwaggerUrl', () => {
  it('TEST-SWAGGER-002 returns the local Swagger UI URL for the listening port', () => {
    expect(getSwaggerUrl(4310)).toBe('http://localhost:4310/api/docs');
  });
});
