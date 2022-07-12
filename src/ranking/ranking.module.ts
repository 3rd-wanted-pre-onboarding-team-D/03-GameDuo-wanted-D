import { Module } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RankingController } from './ranking.controller';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        url: 'redis://localhost:6379',
      },
    }),
  ],
  providers: [RankingService],
  controllers: [RankingController],
})
export class RankingModule {}
