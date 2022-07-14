import moment, { Moment, now } from 'moment';
import {
  Column,
  Entity,
  ManyToOne,
  MongoClient,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RaidRecordType } from './raid-record-type';
import { User } from './user.entity';

@Entity()
export class RaidRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.records, { lazy: true }) // user와 record 1:N
  user: User;

  @Column()
  level: number;

  @Column({ default: 0 })
  score: number;

  @Column({ type: 'enum', enum: RaidRecordType })
  type: RaidRecordType;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ type: 'datetime' })
  scheduledEndTime: Date;

  start(now: Moment, level: number, type: RaidRecordType, user: User) {
    this.startTime = now.toDate();
    this.level = level;
    this.type = type;
    this.user = user;
    this.scheduledEndTime = now.add(3, 'minutes').toDate();
  }

  isEnded() {
    return (
      this.type === RaidRecordType.FAIL || this.type === RaidRecordType.SUCCESS
    );
  }

  isTimeout(now: Moment) {
    return now.isAfter(moment(this.scheduledEndTime));
  }

  success(now: Moment) {
    this.type = RaidRecordType.SUCCESS;
    this.endTime = now.toDate();
  }
}
