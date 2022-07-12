import { RaidRecord } from '../../entity/raid-record.entity';

export class RaidStatusDto {
  canEnter: boolean;
  enteredUserId: number;

  static async of(raidRecord: RaidRecord) {
    const raidStatusDto = new RaidStatusDto();
    if (!raidRecord || raidRecord.isEnded()) {
      raidStatusDto.canEnter = true;
      return raidStatusDto;
    } else {
      raidStatusDto.canEnter = false;
      raidStatusDto.enteredUserId = (await raidRecord.user)?.userId;
    }
    return raidStatusDto;
  }
}
