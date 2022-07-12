import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RankingService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  // 랭킹 추가
  addRank(key: string, value: number) {
    this.redis.zadd('raid_record', key, value);
  }

  // 랭킹 조회 (점수 높은 순)
  getRank() {
    this.redis.zrevrange('raid_record', 0, 10, 'WITHSCORES');
  }
}
