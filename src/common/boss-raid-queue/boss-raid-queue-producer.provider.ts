import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class BossRaidQueueProducer {
  constructor(
    @InjectQueue('raidQueue')
    private raidQueue: Queue,
  ) {}

  async isRaidQueueEmpty() {
    const size = await this.raidQueue.count();
    return size === 0;
  }

  async createRaidInfo(userId: number, raidId: number, delay: number) {
    const raid = await this.raidQueue.add(
      'raid',
      {
        userId,
        raidId,
      },
      {
        delay,
      },
    );

    return raid;
  }
}
