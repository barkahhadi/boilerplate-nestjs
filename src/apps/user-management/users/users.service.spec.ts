import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import globalModule from '@/global-module';
import { PrismaService } from '@/utils/prisma/prisma.service';
import { DataTableService } from '@/utils/DataTable/DataTable.service';
import * as bcrypt from 'bcrypt';

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

describe('UsersService', () => {
  let service: UsersService;
  let dataTable: DataTableService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: globalModule,
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    dataTable = module.get<DataTableService>(DataTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      dataTable.executeQuery = jest.fn().mockResolvedValue({
        data: [userData],
        total: 1,
      });
      const result = await service.findAll({
        page: 1,
        perPage: 10,
      });

      expect(result).toEqual({
        data: [userData],
        total: 1,
      });
    });
  });
  describe('findActiveUsers', () => {
    it('should find active user', async () => {
      prisma.user.findFirst = jest.fn().mockResolvedValue(userData);
      const result = await service.findActiveUsers(userData.id);
      expect(result).toEqual(userData);
    });
  });
  describe('findOne', () => {
    it('should find one user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(userData);
      const result = await service.findOne(userData.id);
      expect(result).toEqual(userData);
    });
  });
  describe('findByUsernameOrEmail', () => {
    it('should find by username or email', async () => {
      prisma.user.findFirst = jest.fn().mockResolvedValue(userData);
      const result = await service.findByUsernameOrEmail(userData.username);
      expect(result).toEqual(userData);
    });
  });
  describe('create', () => {
    it('should throw email duplicate error when create user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue('admin@demo.com');

      // shold be error
      await expect(
        service.create({
          ...userData,
          password: '12345',
        }),
      ).rejects.toThrowError();
    });
    it('should throw error role not found when create user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.role.findFirst = jest.fn().mockResolvedValue(null);

      await expect(
        service.create({
          ...userData,
          password: '12345',
        }),
      ).rejects.toThrowError();
    });

    it('should create user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.role.findFirst = jest.fn().mockResolvedValue({
        id: 'admin',
        name: 'Administrator',
      });

      prisma.user.create = jest.fn().mockResolvedValue(userData);

      const result = await service.create({
        ...userData,
        password: '12345',
      });

      expect(result).toEqual(userData);
    });
  });
  describe('update', () => {
    it('should throw email duplicate error when update user', async () => {
      prisma.user.findFirst = jest.fn().mockResolvedValue('admin@demo.com');

      // shold be error
      await expect(
        service.update(userData.id, {
          ...userData,
          password: '12345',
        }),
      ).rejects.toThrowError();
    });

    it('should throw error role not found when update user', async () => {
      prisma.user.findFirst = jest.fn().mockResolvedValue(null);
      prisma.role.findFirst = jest.fn().mockResolvedValue(null);

      await expect(
        service.update(userData.id, {
          ...userData,
          password: '12345',
        }),
      ).rejects.toThrowError();
    });

    it('should update user', async () => {
      prisma.user.findFirst = jest.fn().mockResolvedValue(null);
      prisma.role.findFirst = jest.fn().mockResolvedValue({
        id: 'admin',
        name: 'Administrator',
      });

      prisma.user.update = jest.fn().mockResolvedValue(userData);

      const result = await service.update(userData.id, {
        ...userData,
        password: '12345',
      });

      expect(result).toEqual(userData);
    });
  });
  describe('remove', () => {
    it('should throw error user not found when delete user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.remove(userData.id)).rejects.toThrowError(
        'User not found',
      );
    });

    it('should delete user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(userData);
      prisma.user.delete = jest.fn().mockResolvedValue(userData);

      const result = await service.remove(userData.id);

      expect(result).toEqual(userData);
    });
  });
  describe('getAllPermissions', () => {
    it('should get all permissions', async () => {
      prisma.role.findFirst = jest.fn().mockResolvedValue({
        id: 'admin',
        name: 'Administrator',
        permissions: [
          {
            id: 'user-management',
            name: 'User Management',
          },
        ],
      });

      const result = await service.getAllPermissions(userData.id);
      expect(result).toEqual([
        {
          id: 'user-management',
          name: 'User Management',
        },
      ]);
    });
  });
  describe('changePassword', () => {
    it('should throw error if user not found when change password', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.changePassword(userData.id, '12345', '54321'),
      ).rejects.toThrowError('User not found');
    });

    it('should throw error if password not match found when change password', async () => {
      const oldPassword = await bcrypt.hash('12345', 10);
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        ...userData,
        password: oldPassword,
      });

      prisma.user.update = jest.fn().mockResolvedValue(userData);

      // const result = await service.changePassword(userData.id, '123456', '54321');

      expect(
        service.changePassword(userData.id, '123456', '54321'),
      ).rejects.toThrowError('Password is incorrect');
    });

    it('should change password', async () => {
      const oldPassword = await bcrypt.hash('12345', 10);
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        ...userData,
        password: oldPassword,
      });

      prisma.user.update = jest.fn().mockResolvedValue(userData);

      const result = await service.changePassword(
        userData.id,
        '12345',
        '54321',
      );
      expect(result).toEqual(userData);
    });
  });
});
