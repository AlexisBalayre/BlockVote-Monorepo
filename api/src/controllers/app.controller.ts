import { Controller, Get } from '@nestjs/common';
import { AppService } from '@src/services';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(): Record<string, string> {
    return this.healthcheck();
  }

  @Get('health')
  healthcheck(): Record<string, string> {
    return {
      status: 'live',
    };
  }
}
