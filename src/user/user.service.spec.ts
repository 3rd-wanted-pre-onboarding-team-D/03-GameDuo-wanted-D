/**
 * made by 고현석
 */
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//import { USER_REPOSITORY } from '../constants';

const userCreateDto: CreateUserDto = {
  email: 'example2@test.com',
  password: 'example2!',
  nickname: 'user2',
};

const mockUserRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn(),
  delete: jest.fn(),
});
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

class MockUserRepository {
  #data: User[] = [
    {
      userId: 1,
      email: 'example1@test.com',
      password: 'example1!',
      nickname: 'user1',
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      records: null,
    },
  ];
  async create(userCreateDto: CreateUserDto) {
    const user: User = new User();
    user.userId = 2;
    user.email = userCreateDto.email;
    user.password = userCreateDto.password;
    user.nickname = userCreateDto.nickname;
    user.createdAt = new Date(Date.now());
    user.updatedAt = new Date(Date.now());
    user.records = null;

    return this.#data.push(user);
  }

  async findOne(id: number) {
    this.#data.forEach((data) => {
      if (data.userId == id) {
        return data;
      }
    });
    return null;
  }
}

describe('UserService', () => {
  let service: UserService;
  let USER_REPOSITORY: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    USER_REPOSITORY = module.get<MockRepository<User>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
