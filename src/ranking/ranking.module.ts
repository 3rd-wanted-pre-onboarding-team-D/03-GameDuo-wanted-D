import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RankingService } from './ranking.service';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        url: 'redis://localhost:6379',
      },
    }),
  ],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
