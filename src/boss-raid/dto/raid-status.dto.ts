import { RaidRecord } from '../../entity/raid-record.entity';

export class RaidStatusDto {
  canEnter: boolean;
  enteredUserId: number;

  static of(raidRecord: RaidRecord) {
    const raidStatusDto = new RaidStatusDto();
    if (!raidRecord || raidRecord.isEnded()) {
      raidStatusDto.canEnter = true;
      return raidStatusDto;
    } else {
      raidStatusDto.canEnter = false;
      raidStatusDto.enteredUserId = raidRecord.user.userId;
    }
    return raidStatusDto;
  }
}
