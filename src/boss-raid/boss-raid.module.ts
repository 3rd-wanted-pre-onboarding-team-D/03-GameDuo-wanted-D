import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { TypeormModule } from 'typeorm.module';
import { BossRaidController } from './boss-raid.controller';
import { bossRaidProviders } from './boss-raid.providers';
import { BossRaidService } from './boss-raid.service';

@Module({
  imports: [TypeormModule, CacheModule.register(), HttpModule],
  controllers: [BossRaidController],
  providers: [...bossRaidProviders, BossRaidService],
})
export class BossRaidModule {}
