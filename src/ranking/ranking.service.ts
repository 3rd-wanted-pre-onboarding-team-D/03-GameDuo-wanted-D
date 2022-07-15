import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class RankingService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  // 랭킹 추가
  async updateRank(key: number, value: number) {
    const result = await this.redis.zadd('raid_record', value, key);
    return result
      ? result
      : new BadRequestException('데이터 중복으로 랭킹패치를 실패했습니다.');
  }

  // 랭킹 조회 (점수 높은 순으로 10등까지)
  getRank() {
    const result = this.redis.zrevrange('raid_record', 0, 9, 'WITHSCORES');
    return result;
  }
}
