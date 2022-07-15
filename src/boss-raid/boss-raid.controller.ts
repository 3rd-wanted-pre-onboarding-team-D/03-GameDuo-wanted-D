import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import moment from 'moment';
import { HttpExceptionFilter } from '../http-exception.filter';
import { BossRaidService } from './boss-raid.service';
import { RaidEndRequestDto } from './dto/raid-end-request.dto';
import { RaidStartRequestDto } from './dto/raid-start-request.dto';

@Controller('bossRaid')
export class BossRaidController {
  constructor(private readonly bossRaidService: BossRaidService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getStatus() {
    return this.bossRaidService.getStatus();
  }

  @Post('/enter')
  @HttpCode(HttpStatus.CREATED)
  async start(@Body(ValidationPipe) raidStartRequestDto: RaidStartRequestDto) {
    const { userId, level } = raidStartRequestDto;
    console.log(userId, level);
    const result = await this.bossRaidService.startRaid(userId, level);
    return result;
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

  @Get('topRankerList')
  @HttpCode(HttpStatus.OK)
  async getRanking(@Body('userId') userId: number) {
    const result = await this.bossRaidService.getRanking(userId);
    return result;
  }
}
