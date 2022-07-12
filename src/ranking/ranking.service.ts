import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RankingService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setKey(key: string, value: string) {
    this.redis.zadd();
  }
}
