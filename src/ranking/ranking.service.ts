import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RankingService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  // 랭킹 추가
  addRank(key: string, value: number) {
    return this.redis.zadd('raid_record', value, key);
  }

  // 랭킹 조회 (점수 높은 순으로 10등까지)
  async getRank() {
    return this.redis.zrevrange('raid_record', 0, 10, 'WITHSCORES');
  }
}
