/**
 * made by 고현석
 */

import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[a-zA-Z])((?=.*\d)(?=.*\W)).{8,16}$/, {
    message:
      '비밀번호는 문자, 숫자, 특수문자가 최소 1개 이상 포함되며 8자리에서 최대 16자리 문자열입니다.',
  })
  password: string;

  @IsNotEmpty()
  @Matches(/.{2,10}$/, {
    message: '닉네임은 최소 2자리에서 최대 10자리 문자열입니다.',
  })
  nickname: string;
}
