export class UserDataDto {
  userid: number;
  email: string;
  password: string;
  nickname: string;
  createAt: Date;
  updatedAt: Date;
  score: number;

  constructor(
    userid: number,
    email: string,
    password: string,
    nickname: string,
    createAt: Date,
    updatedAt: Date,
    score: number,
  ) {
    this.userid = userid;
    this.email = email;
    this.password = password;
    this.nickname = nickname;
    this.createAt = createAt;
    this.updatedAt = updatedAt;
    this.score = score;
  }
}
