import { APP_DATABASE } from 'src/constants';
import { RaidRecord } from 'src/entity/raid-record.entity';
import { User } from 'src/entity/user.entity';
import { DataSource } from 'typeorm';

export const ormConfig = [
  {
    provide: APP_DATABASE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: 3306,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [User, RaidRecord],
        charset: 'utf8mb4',
        synchronize: true,
        logging: true, //쿼리문 로그
        timezone: '+00:00',
      });

      return dataSource.initialize();
    },
  },
];
