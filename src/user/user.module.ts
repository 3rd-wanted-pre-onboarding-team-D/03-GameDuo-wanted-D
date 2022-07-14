import { Module } from '@nestjs/common';
import { TypeormModule } from 'typeorm.module';
import { UserController } from './user.controller';
import { userProviders } from './user.providers';
import { UserService } from './user.service';

@Module({
  imports: [TypeormModule],
  controllers: [UserController],
  providers: [...userProviders, UserService],
  exports: [...userProviders],
})
export class UserModule {}
