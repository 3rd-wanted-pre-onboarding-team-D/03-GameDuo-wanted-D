import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RAID_REPOSITORY } from '../constants';
import { RaidRecord } from '../entity/raid-record.entity';
import { Repository } from 'typeorm';
import { RaidStatusDto } from './dto/raid-status.dto';
import { Moment } from 'moment';
import { RankingService } from '../ranking/ranking.service';

@Injectable()
export class BossRaidService {
  constructor(
    @Inject(RAID_REPOSITORY)
    private raidRepository: Repository<RaidRecord>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    private readonly httpService: HttpService,

    private readonly rankingService: RankingService,
  ) {
    /**
     * 생성 시점에 Static Data 가져오기 위해 실행
     */
    this.refreshCachingData();
  }
  /**
   * Example Function Repository를 이용한 것
   */
  //   async findAll(): Promise<User[]> {
  //     return this.raidRepository.find();
  //   }

  private async fetchCachingData() {
    return this.httpService.axiosRef.get(
      'https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json',
    );
  }
  public async refreshCachingData() {
    const data = await this.fetchCachingData();
    const staticData = data.data.bossRaids[0]; // S3 저장소에서 가져온 정적 데이터
    console.log();

    /**
     *  in Memory Caching
     */
    await this.cacheManager.set(
      'bossRaidLimitSeconds',
      staticData.bossRaidLimitSeconds,
    );

    await this.cacheManager.set('level_1', staticData.levels[0].score);
    await this.cacheManager.set('level_2', staticData.levels[1].score);
    await this.cacheManager.set('level_3', staticData.levels[2].score);

    /**
     *  Memory 값 확인용 console Test 해보고 지우셔도 됩니다.
     */
    console.log(await this.cacheManager.get('bossRaidLimitSeconds'));
    console.log(await this.cacheManager.get('level_1'));
    console.log(await this.cacheManager.get('level_2'));
    console.log(await this.cacheManager.get('level_3'));
  }

  async getStatus() {
    const record = await this.raidRepository
      .createQueryBuilder('raidRecord')
      .leftJoinAndSelect('raidRecord.user', 'user')
      .orderBy('id', 'DESC')
      .getOne();

    return RaidStatusDto.of(record);
  }

  async endRaid(raidRecordId: number, userId: number, now: Moment) {
    const record = await this.raidRepository.findOne({
      where: {
        id: raidRecordId,
        user: { userId: userId },
      },
      relations: {
        user: true,
      },
    });

    if (!record) {
      throw new NotFoundException('해당하는 레이드 기록이 존재하지 않습니다');
    }

    if (record.isEnded()) {
      throw new BadRequestException('이미 종료된 레이드입니다');
    }

    if (record.isTimeout(now)) {
      throw new BadRequestException('레이드 제한시간이 초과되었습니다');
    }

    record.success(now);

    await this.raidRepository.save(record);

    await this.fetchRanking((await record.user).userId, record.score);
  }

  // 랭킹 패치
  async fetchRanking(userId: number, score: number) {
    this.rankingService.updateRank(userId, score);
  }

  // 랭킹 조회
  async getRanking() {
    return this.rankingService.getRank();
  }
}
