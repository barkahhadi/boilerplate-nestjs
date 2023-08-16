import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import globalModule from '@/global-module';
import { Auth } from './entities/auth.entity';
import { UsersModule } from '../user-management/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../user-management/users/users.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRefreshDto } from './dto/auth-refresh.dto';

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ...globalModule,
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_EXPIRES },
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPermissions', () => {
    it('should return a list of permissions', async () => {
      const mockPermissions = [
        {
          id: 'admin',
          name: 'Administrator',
          permissions: [
            {
              id: 'user-management',
              name: 'User Management',
            },
          ],
        },
      ];
      jest
        .spyOn(usersService, 'getAllPermissions')
        .mockResolvedValue(mockPermissions);

      const mockRequest = {
        user: {
          roleId: 'admin',
        },
      };
      const result = await controller.getPermissions(mockRequest);

      expect(usersService.getAllPermissions).toHaveBeenCalledWith('admin');
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('login', () => {
    it('should return an auth token', async () => {
      const authData: AuthLoginDto = {
        username: 'admin',
        password: '12345',
      };

      const authResponse = {
        token: 'token',
        refreshToken: 'refreshToken',
        user: {
          id: '1',
          username: 'admin',
        },
      };

      authService.login = jest.fn().mockResolvedValue(authResponse);

      await controller.login(authData, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(authResponse);
    });
  });

  describe('refresh', () => {
    it('should return a new auth token', async () => {
      const mockRefreshData = {
        token: 'token',
        refreshToken: 'refreshToken',
        user: {
          id: '1',
          username: 'admin',
        },
      };

      authService.refresh = jest.fn().mockResolvedValue(mockRefreshData);

      const mockAuthRefreshDto: AuthRefreshDto = {
        token: 'mockRefreshToken',
      };

      await controller.refresh(mockAuthRefreshDto, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRefreshData);
    });
  });
});
