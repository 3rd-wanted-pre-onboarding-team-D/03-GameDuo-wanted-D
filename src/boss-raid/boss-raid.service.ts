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
import { RankingService } from '../ranking/ranking.service';
import { RankingInfo } from './ranking-info.interface';

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
          raidRecord.start(
            moment().utc(true),
            level,
            RaidRecordType.START,
            user,
          );

          const createdRecord = await queryRunner.manager.save(raidRecord);
          // const delay: number =
          //   Number(await this.cacheManager.get('bossRaidLimitSeconds')) * 1000;

          await this.raidQueueProducer.createRaidInfo(
            userId,
            createdRecord.id,
            180000, // delay 변수로 쓰면 상태 변경이 즉시 일어남 이유는 모르겠음..
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

    let score: number;

    if (record.level === 1) score = 20;
    if (record.level === 2) score = 47;
    if (record.level === 3) score = 85;

    record.success(now, score);

    await this.raidRepository.save(record);

    await this.fetchRanking((await record.user).userId, record.score);
  }

  // 랭킹 패치
  fetchRanking(userId: number, score: number) {
    this.rankingService.updateRank(userId, score);
  }

  // 랭킹 조회
  async getRanking(userId: number) {
    const rankingList = await this.rankingService.getRank();

    const { rankerInfoList, myRankingInfo } = this.makeRankInfo(
      rankingList,
      userId,
    );

    return {
      topRankerInfoList: rankerInfoList,
      myRankingInfo: myRankingInfo,
    };
  }

  // 랭킹 데이터 파싱
  makeRankInfo(rankingList, userId: number) {
    // rankingList ['id1','score1','id2','score2'] score Desc

    const rankerInfoList: RankingInfo[] = [];

    for (let i = 0; i < rankingList.length; i++) {
      const rankData: RankingInfo = {
        ranking: i,
        userId: rankingList[2 * i],
        totalScore: rankingList[2 * i + 1],
      };
      rankerInfoList.push(rankData);
    }

    let myRankingInfo: RankingInfo;

    const myRankIdx = rankingList.indexOf(`${userId}`);

    if (myRankIdx === -1) {
      // 입력한 userId의 랭킹정보가 없는경우 === 게임기록이 없는경우
      myRankingInfo = { ranking: null, userId: userId, totalScore: 0 };
    } else {
      const myRank = myRankIdx / 2;

      const myTotalScore = rankingList[myRankIdx + 1];

      myRankingInfo = {
        ranking: myRank,
        userId: userId,
        totalScore: myTotalScore,
      };
    }

    return { rankerInfoList, myRankingInfo };
  }
}
