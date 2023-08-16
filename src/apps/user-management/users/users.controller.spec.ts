import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import globalModule from '@/global-module';
import { DataTableDto } from '@/utils/datatable/datatable.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { before } from 'node:test';

const userData = {
  id: 'a0cb1548-e95d-46b1-a3c7-719c67d9ec5b',
  username: 'admin',
  email: 'admin@demo.com',
  name: 'Administrator',
  phone: '08123456789',
  address: 'Jl. Demo No. 123',
  isActive: true,
  roleId: 'admin',
};

const mockUsersService = {
  findAll: jest.fn().mockResolvedValue({
    data: [userData],
    total: 1,
  }),
  findOne: jest.fn().mockImplementation((id: string) => {
    return userData;
  }),
  create: jest.fn().mockImplementation((createUserDto: CreateUserDto) => {
    return userData;
  }),
  update: jest
    .fn()
    .mockImplementation((id: string, updateUserDto: UpdateUserDto) => {
      return userData;
    }),
  remove: jest.fn().mockResolvedValue(userData),
};

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: globalModule,
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const result = {
        data: [userData],
        total: 1,
      };
      const params: DataTableDto = {
        page: 1,
        perPage: 10,
      };

      expect(await controller.findAll(params)).toEqual(result);
    });
  });
  describe('findOne', () => {
    it('should find one user', async () => {
      const result = userData;

      expect(await controller.findOne(userData.id)).toEqual(result);
    });
  });
  describe('create', () => {
    it('should create user', async () => {
      const result = userData;
      const createUserDto: CreateUserDto = {
        ...userData,
        password: '12345',
      };

      expect(await controller.create(createUserDto)).toEqual(result);
    });
  });

  describe('updatePassword', () => {
    it('should update password user', async () => {
      const result = userData;
      const updateUserDto: UpdateUserDto = {
        password: '54321',
      };

      expect(
        await controller.updatePassword(userData.id, updateUserDto),
      ).toEqual(result);
    });
  });
  describe('update', () => {
    it('should update user', async () => {
      const result = userData;
      const updateUserDto: UpdateUserDto = {
        ...userData,
        password: null,
      };

      expect(await controller.update(userData.id, updateUserDto)).toEqual(
        result,
      );
    });
  });
  describe('remove', () => {
    it('should remove user', async () => {
      const result = userData;

      expect(await controller.remove(userData.id)).toEqual(result);
    });
  });
});
