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
    it('중복된 값을 랭킹패치 하려는 경우 BadRequestException를 보내는가', () => {
      const userId = 1;
      const score = 100;

      const result = service.updateRank(userId, score);
      expect(result).rejects.toThrow(BadRequestException);
    });

    it('랭킹 조회에 실패한 경우 BadRequestException를 보내는가', () => {
      const result = service.getRank();
      expect(result).rejects.toThrow(BadRequestException);
    });
  });
});
