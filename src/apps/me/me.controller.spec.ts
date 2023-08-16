import { Test, TestingModule } from '@nestjs/testing';
import { MeController } from './me.controller';
import { UsersService } from '../user-management/users/users.service';
import globalModule from '@/global-module';

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
const permissions = [
  {
    application: 'role-management',
    ability: [
      {
        module: 'roles',
        permissions: ['create', 'update', 'delete', 'read'],
      },
      { module: 'roles', permissions: ['create', 'read', 'update'] },
      {
        module: 'offices',
        permissions: ['create', 'read', 'update', 'delete'],
      },
    ],
  },
];

describe('MeController', () => {
  let controller: MeController;
  let userService: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: globalModule,
      controllers: [MeController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findActiveUsers: jest.fn().mockResolvedValue(userData),
            getAllPermissions: jest.fn().mockResolvedValue(permissions),
            changePassword: jest.fn().mockResolvedValue(userData),
            update: jest.fn().mockResolvedValue(userData),
          },
        },
      ],
    }).compile();

    controller = module.get<MeController>(MeController);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const result = await controller.getProfile({
        user: {
          id: userData.id,
        },
      });
      expect(result).toEqual({
        ...userData,
        permissions,
      });
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const result = await controller.changePassword(
        {
          user: {
            id: userData.id,
          },
        },
        {
          oldPassword: 'admin123',
          newPassword: 'admin123',
        },
      );
      expect(result).toEqual(userData);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const result = await controller.update(
        {
          user: {
            id: userData.id,
          },
        },
        {
          name: 'Administrator',
          phone: '08123456789',
          address: 'Jl. Demo No. 123',
          password: null,
        },
      );
      expect(result).toEqual(userData);
    });
  });
});
