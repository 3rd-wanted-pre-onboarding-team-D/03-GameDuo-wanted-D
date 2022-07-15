import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { RAID_REPOSITORY } from '../../constants';
import { RaidRecord } from '../../entity/raid-record.entity';
import { Repository } from 'typeorm';
import { RaidRecordType } from '../../entity/raid-record-type';

@Processor('raidQueue')
export class BossRaidQueueConsumer {
  private readonly logger = new Logger(BossRaidQueueConsumer.name);
  constructor(
    @Inject(RAID_REPOSITORY)
    private raidRepository: Repository<RaidRecord>,
  ) {}

  @Process('raid')
  async changeRaidStatusAfterThreeMinutes(raidInfo: Job) {
    const {
      data: { userId, raidId },
    } = raidInfo;

    this.logger.log(
      `유저 ${userId} 가 생성한 레이드 ${raidId} 번 작업을 수신하였습니다.`,
    );

    const record = await this.raidRepository.findOneBy({
      id: raidId,
      user: { userId },
    });

    if (!record.isEnded()) {
      record.type = RaidRecordType.FAIL;
      await this.raidRepository.save(record);
      this.logger.log(`레이드 레코드 ${raidId} 번 의 상태를 변경하였습니다.`);
    }
  }
}
