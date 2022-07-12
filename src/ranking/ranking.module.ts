import { Module, CacheModule } from '@nestjs/common';
import { RankingService } from './ranking.service';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
  ],
  providers: [RankingService],
})
export class RankingModule {}
