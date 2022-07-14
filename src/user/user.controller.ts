/**
 * made by 고현석
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/signUp')
  async signUp(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    await this.userService.signUp(
      createUserDto.email,
      createUserDto.password,
      createUserDto.nickname,
    );
  }

  @Get(':id')
  async getUserData(
    @Param('id') id: number,
    @Body('password') password: string,
  ) {
    return await this.userService.getUserData(id, password);
  }
}
