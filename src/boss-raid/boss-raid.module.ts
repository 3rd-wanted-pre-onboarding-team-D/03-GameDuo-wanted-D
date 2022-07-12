import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { TypeormModule } from 'typeorm.module';
import { BossRaidController } from './boss-raid.controller';
import { bossRaidProviders } from './boss-raid.providers';
import { BossRaidService } from './boss-raid.service';

@Module({
  imports: [
    TypeormModule,
    CacheModule.register({ store: redisStore, host: 'localhost', port: 6379 }),
    HttpModule,
  ],
  controllers: [BossRaidController],
  providers: [...bossRaidProviders, BossRaidService],
})
export class BossRaidModule {}
