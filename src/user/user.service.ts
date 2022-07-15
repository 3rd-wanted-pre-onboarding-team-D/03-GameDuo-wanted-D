/**
 * made by 고현석
 */
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../constants';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: Repository<User>,
  ) {}

  async signUp(email: string, password: string, nickname: string) {
    const hashPassword: string = await bcrypt.hash(password, 10);

    const user: User = new User();
    user.email = email;
    user.password = hashPassword;
    user.nickname = nickname;
    await this.userRepository.save(user);
  }

  async getUserData(id: number, password: string) {
    const user: User = await this.userRepository.findOne({
      where: { userId: id },
    });

    try {
      if (!user) {
        throw new BadRequestException('없는 유저입니다');
      } else {
        if (!(await bcrypt.compare(password, user.password))) {
          throw new UnauthorizedException('비밀번호가 일치하지 않습니다');
        }
      }
      console.log(user);
      return { success: true, user };
    } catch (error) {
      const response: any = error.response;
      return { success: false, response };
    }
  }
}
