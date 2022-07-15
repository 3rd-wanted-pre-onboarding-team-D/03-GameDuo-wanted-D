import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BossRaidModule } from './boss-raid/boss-raid.module';
import { UserModule } from './user/user.module';
import { RankingModule } from './ranking/ranking.module';
@Module({
  imports: [UserModule, ConfigModule.forRoot(), BossRaidModule, RankingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
