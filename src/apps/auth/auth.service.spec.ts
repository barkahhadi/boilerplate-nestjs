import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@apps/user-management/users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import globalModule from '@/global-module';
import { UsersModule } from '../user-management/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './guards/local.strategy';
import { JwtStrategy } from './guards/jwt.strategy';

jest.mock('bcrypt');
const mockUser = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
  email: 'johndoe@example.com',
  roleId: 'admin',
  role: {
    id: 'admin',
    name: 'Admin',
  },
  isActive: true,
};
describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeAll(async () => {
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
      providers: [AuthService, LocalStrategy, JwtStrategy],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user object if username and password are valid', async () => {
      jest.spyOn(usersService, 'findByUsernameOrEmail').mockResolvedValue({
        ...mockUser,
        password: 'password',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const result = await authService.validateUser('johndoe', 'password');

      expect(usersService.findByUsernameOrEmail).toHaveBeenCalledWith(
        'johndoe',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'password');
      const result2 = mockUser;

      expect(result).toEqual(result2);
    });

    it('should throw BadRequestException if username or password is invalid', async () => {
      jest.spyOn(usersService, 'findByUsernameOrEmail').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        authService.validateUser('johndoe', 'password'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return token, refreshToken, and user object if login is successful', async () => {
      jest.spyOn(usersService, 'findByUsernameOrEmail').mockResolvedValue({
        ...mockUser,
        password: 'password',
      });

      const mockPayload = {
        id: '1',
        name: 'John Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
        roleId: 'admin',
      };
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');

      const mockAuthLoginDto = {
        username: 'johndoe',
        password: 'password',
      };
      const result = await authService.login(mockAuthLoginDto);

      expect(usersService.findByUsernameOrEmail).toHaveBeenCalledWith(
        'johndoe',
      );

      expect(jwtService.sign).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual({
        token: 'mockToken',
        refreshToken: 'mockToken',
        user: {
          id: '1',
          username: 'johndoe',
          email: 'johndoe@example.com',
          name: 'John Doe',
          role: {
            id: 'admin',
            name: 'Admin',
          },
        },
      });
    });

    it('should throw BadRequestException if user is not active', async () => {
      jest.spyOn(usersService, 'findByUsernameOrEmail').mockResolvedValue(null);

      const mockAuthLoginDto = {
        username: 'johndoe',
        password: 'password',
      };

      await expect(authService.login(mockAuthLoginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user has no role', async () => {
      jest.spyOn(usersService, 'findByUsernameOrEmail').mockResolvedValue({
        ...mockUser,
        roleId: null,
        password: 'password',
      });

      const mockAuthLoginDto = {
        username: 'johndoe',
        password: 'password',
      };
      await expect(authService.login(mockAuthLoginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if username or password is invalid', async () => {
      jest.spyOn(usersService, 'findByUsernameOrEmail').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const mockAuthLoginDto = {
        username: 'johndoe',
        password: 'password',
      };
      await expect(authService.login(mockAuthLoginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('refresh', () => {
    it('should return token, refreshToken, and user object if refresh is successful', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ id: '1' });
      jest.spyOn(usersService, 'findActiveUsers').mockResolvedValue(mockUser);

      const mockPayload = {
        id: '1',
        username: 'johndoe',
        email: 'johndoe@example.com',
        name: 'John Doe',
        roleId: 'admin',
      };
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');

      const result = await authService.refresh('mockRefreshToken');

      expect(jwtService.verify).toHaveBeenCalledWith('mockRefreshToken');
      expect(usersService.findActiveUsers).toHaveBeenCalledWith('1');
      expect(jwtService.sign).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual({
        token: 'mockToken',
        refreshToken: 'mockToken',
        user: {
          id: '1',
          username: 'johndoe',
          email: 'johndoe@example.com',
          isActive: true,
          name: 'John Doe',
          roleId: 'admin',
          role: {
            id: 'admin',
            name: 'Admin',
          },
        },
      });
    });

    it('should throw BadRequestException if refresh token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });

      await expect(authService.refresh('mockRefreshToken')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user is not active', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ id: '1' });
      jest.spyOn(usersService, 'findActiveUsers').mockResolvedValue(null);

      await expect(authService.refresh('mockRefreshToken')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
