import { IsNotEmpty, IsNumber } from 'class-validator';

export class RaidRankingRequestDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
