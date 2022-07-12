import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RAID_REPOSITORY } from '../constants';
import { RaidRecord } from '../entity/raid-record.entity';
import { Repository } from 'typeorm';
import { RaidStatusDto } from './dto/raid-status.dto';

@Injectable()
export class BossRaidService {
  constructor(
    @Inject(RAID_REPOSITORY)
    private raidRepository: Repository<RaidRecord>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    private readonly httpService: HttpService,
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
}
