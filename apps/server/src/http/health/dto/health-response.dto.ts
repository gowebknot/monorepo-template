import { ApiProperty } from '@nestjs/swagger';
import type { HealthResponse } from '@monorepo-template/entities';

export class HealthResponseDto implements HealthResponse {
  @ApiProperty({
    description: 'The server readiness state.',
    enum: ['ok'],
    example: 'ok',
  })
  status!: 'ok';
}
