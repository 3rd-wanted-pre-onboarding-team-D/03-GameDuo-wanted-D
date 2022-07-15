import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { BossRaidQueueModule } from '../common/boss-raid-queue/boss-raid-queue.module';
import { TypeormModule } from 'typeorm.module';
import { BossRaidController } from './boss-raid.controller';
import { bossRaidProviders } from './boss-raid.providers';
import { BossRaidService } from './boss-raid.service';
import { RankingModule } from '../ranking/ranking.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeormModule,
    CacheModule.register(),
    HttpModule,
    BossRaidQueueModule,
    UserModule,
    RankingModule,
  ],
  controllers: [BossRaidController],
  providers: [...bossRaidProviders, BossRaidService],
})
export class BossRaidModule {}
