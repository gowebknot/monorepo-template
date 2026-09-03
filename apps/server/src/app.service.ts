import { Injectable } from '@nestjs/common';
import {
  healthResponseSchema,
  type HealthResponse,
} from '@monorepo-template/entities';

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return healthResponseSchema.parse({ status: 'ok' });
  }
}
