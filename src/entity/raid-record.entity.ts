import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RaidRecordType } from './raid-record-type';
import { User } from './user.entity';

@Entity()
export class RaidRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.records, { eager: true }) // user와 record 1:N
  user: User;

  @Column()
  level: number;

  @Column()
  score: number;

  @Column({ type: 'enum', enum: RaidRecordType })
  type: RaidRecordType;

  @Column()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column()
  scheduledEndTime: Date;

  isEnded() {
    return (
      this.type === RaidRecordType.FAIL || this.type === RaidRecordType.SUCCESS
    );
  }
}
