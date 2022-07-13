import { Controller, Get, Post } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Post()
  setRecord() {
    this.rankingService.addRank('key1', 11);
  }

  @Get()
  async getRecord() {
    await this.rankingService.getRank();
  }
}
