import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RAID_REPOSITORY, USER_REPOSITORY } from '../constants';
import { RaidRecord } from '../entity/raid-record.entity';
import { Repository } from 'typeorm';
import { RaidStatusDto } from './dto/raid-status.dto';
import { Moment } from 'moment';
import { ormConfig } from 'typeorm.providers';
import { BossRaidQueueProducer } from 'src/common/boss-raid-queue/boss-raid-queue-producer.provider';
import { User } from '../entity/user.entity';
import { RaidRecordType } from 'src/entity/raid-record-type';
import moment from 'moment';

@Injectable()
export class BossRaidService {
  constructor(
    @Inject(RAID_REPOSITORY)
    private raidRepository: Repository<RaidRecord>,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: Repository<User>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    private readonly httpService: HttpService,

    private readonly raidQueueProducer: BossRaidQueueProducer,
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

  async startRaid(userId: number, level: number) {
    const dataSource = await ormConfig[0].useFactory();
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    let result;

    try {
      result = await queryRunner.manager
        .createQueryBuilder(RaidRecord, 'raidRecord')
        .setLock('pessimistic_read')
        .leftJoinAndSelect('raidRecord.user', 'user')
        .orderBy('id', 'DESC')
        .getOne()
        .then(async (record) => {
          const { canEnter } = await RaidStatusDto.of(record);
          if (!canEnter)
            throw new ConflictException(
              { isEntered: false },
              '레이드에 입장할 수 없습니다.',
            );

          const user = await queryRunner.manager.findOne(User, {
            where: {
              userId,
            },
          });

          const raidRecord = new RaidRecord();
          raidRecord.start(moment().utc(), level, RaidRecordType.START, user);

          const createdRecord = await queryRunner.manager.save(raidRecord);

          await this.raidQueueProducer.createRaidInfo(
            userId,
            createdRecord.id,
            180000,
          );

          return {
            isEntered: true,
            raidRecordId: createdRecord.id,
          };
        });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new ConflictException(
        { isEntered: false },
        '레이드에 입장할 수 없습니다.',
      );
    }

    return result;
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

  async fetchRanking(userId: number, score: number) {
    // TODO: 랭킹 패치
  }
}
