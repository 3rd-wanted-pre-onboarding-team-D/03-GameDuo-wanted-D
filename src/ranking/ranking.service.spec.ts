import { RedisModule } from '@nestjs-modules/ioredis';
import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from './ranking.service';
import { BadRequestException } from '@nestjs/common';
describe('RankingService', () => {
  let service: RankingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          config: {
            url: 'redis://localhost:6379',
          },
        }),
      ],
      providers: [RankingService],
    }).compile();

    service = module.get<RankingService>(RankingService);
  });

  describe('Ranking with Redis', () => {
    it('랭킹 패치에 실패한 경우 BadRequestException를 보내는가', () => {
      const userId = 1;
      const score = 100;

      const result = service.addRank(userId, score);
      expect(result).resolves.toThrowError(BadRequestException);
    });

    it('랭킹 조회에 실패한 경우 BadRequestException를 보내는가', () => {
      const userId = 1;
      const score = 100;
      service.addRank(userId, score);

      const result = service.getRank();
      expect(result).resolves.toThrowError(BadRequestException);
    });
  });
});
