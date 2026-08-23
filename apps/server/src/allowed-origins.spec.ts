import { describe, expect, it } from 'vitest';
import { parseAllowedOrigins } from './allowed-origins';

describe('parseAllowedOrigins', () => {
  it('parses and trims multiple origins', () => {
    expect(
      parseAllowedOrigins(' http://localhost:5173, http://localhost:3000 '),
    ).toEqual(['http://localhost:5173', 'http://localhost:3000']);
  });

  it('allows all origins when the configured list is empty', () => {
    expect(parseAllowedOrigins(' , ')).toBe(true);
  });
});
