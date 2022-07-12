import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { BossRaidService } from './boss-raid.service';

@Controller('bossRaid')
export class BossRaidController {
  constructor(private readonly bossRaidService: BossRaidService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getStatus() {
    return this.bossRaidService.getStatus();
  }
}
