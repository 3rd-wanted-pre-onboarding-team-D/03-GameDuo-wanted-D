import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BossRaidModule } from './boss-raid/boss-raid.module';
import { BossRaidQueueModule } from './common/boss-raid-queue/boss-raid-queue.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(),
    BossRaidModule,
    BossRaidQueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
