import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AppService } from '@/app.service';
import { HealthResponseDto } from '@/http/health/dto/health-response.dto';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Check server health',
    description: 'Confirms that the production server is ready to accept requests.'
  })
  @ApiOkResponse({
    description: 'The server is ready.',
    type: HealthResponseDto,
    examples: {
      ready: {
        summary: 'Ready server response',
        value: { status: 'ok' }
      }
    }
  })
  getHealth(): HealthResponseDto {
    return this.appService.getHealth();
  }
}
