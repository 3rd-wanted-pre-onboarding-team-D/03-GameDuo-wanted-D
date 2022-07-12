import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { BossRaidQueueConsumer } from './boss-raid-queue-consumer.provider';
import { BossRaidQueueProducer } from './boss-raid-queue-producer.provider';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'raidQueue',
    }),
  ],
  providers: [BossRaidQueueProducer, BossRaidQueueConsumer],
  exports: [BossRaidQueueProducer, BossRaidQueueConsumer],
})
export class BossRaidQueueModule {}
