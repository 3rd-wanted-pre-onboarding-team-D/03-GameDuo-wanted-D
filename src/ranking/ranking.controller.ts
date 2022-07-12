import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(@Inject() private readonly rankingService: RankingService) {}

  @Post()
  async add(@Param() score: number) {
    this.rankingService.addRank('key', score);
  }

  @Get()
  async get() {
    this.rankingService.getRank();
  }
}
