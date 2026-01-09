import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mock<Repository<User>>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Mocked<Repository<User>>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = {} as any;
    repo.save.mockResolvedValue(user);

    const result = await service.create({
      name: 'test',
      email: 'test@test.com',
    });

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      name: 'test',
      email: 'test@test.com',
    });
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(user);
  });

  it('should find all users', async () => {
    const users = [] as any;
    repo.find.mockResolvedValue(users);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(result).toEqual(users);
  });

  it('should find a user by id', async () => {
    const user = {} as any;
    repo.findOneBy.mockResolvedValue(user);

    const result = await service.findOne('1');

    expect(repo.findOneBy).toHaveBeenCalledTimes(1);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(result).toEqual(user);
  });

  it('should update a user', async () => {
    const user = {} as any;
    repo.findOneBy.mockResolvedValue(user);
    repo.save.mockResolvedValue(user);

    const result = await service.update('1', {
      name: 'test',
      email: 'test@test.com',
    });

    expect(repo.findOneBy).toHaveBeenCalledTimes(1);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1' });

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith({
      ...user,
      name: 'test',
      email: 'test@test.com',
    });
    expect(result).toEqual(user);
  });

  it('should throw an error if the user is not found', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(
      service.update('1', { name: 'test', email: 'test@test.com' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should remove a user', async () => {
    await service.remove('1');
    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('1');
  });
});
