import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import moment from 'moment';
import { HttpExceptionFilter } from '../http-exception.filter';
import { BossRaidService } from './boss-raid.service';
import { RaidEndRequestDto } from './dto/raid-end-request.dto';

@Controller('bossRaid')
export class BossRaidController {
  constructor(private readonly bossRaidService: BossRaidService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getStatus() {
    return this.bossRaidService.getStatus();
  }

  @Patch('/end')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseFilters(new HttpExceptionFilter())
  async end(@Body(ValidationPipe) raidEndRequestDto: RaidEndRequestDto) {
    await this.bossRaidService.endRaid(
      raidEndRequestDto.raidRecordId,
      raidEndRequestDto.userId,
      moment().utc(),
    );
  }
}
