import { IsNumber, Max, Min } from 'class-validator';

export class RaidStartRequestDto {
  @IsNumber()
  @Min(1)
  userId: number;

  @IsNumber()
  @Min(1)
  @Max(3)
  level: number;
}
