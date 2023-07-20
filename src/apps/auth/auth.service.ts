import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthLoginDto } from './dto/auth-login.dto';
import { UsersService } from '@apps/user-management/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(usernameOrEmail: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsernameOrEmail(usernameOrEmail);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    } else {
      throw new BadRequestException('Invalid username or password');
    }
    return null;
  }

  async login(authLoginDto: AuthLoginDto) {
    try {
      const user = await this.usersService.findByUsernameOrEmail(
        authLoginDto.username,
      );

      if (!user) {
        return new BadRequestException('Invalid username or password');
      }

      if (!user.isActive) {
        return new BadRequestException('User is not active');
      }

      if (!user.roleId) {
        return new BadRequestException('User has no role');
      }

      const payload = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        officeId: user.officeId,
      };
      return {
        token: this.jwtService.sign(payload),
        refreshToken: this.jwtService.sign(payload, {
          expiresIn: process.env.JWT_REFRESH_EXPIRES,
        }),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: {
            ...user.role,
          },
          office: {
            ...user.office,
          },
        },
      };
    } catch (err) {
      return new BadRequestException('Invalid username or password');
    }
  }

  async refresh(refreshToken: string) {
    try {
      const verify = this.jwtService.verify(refreshToken);

      if (verify) {
        const user = await this.usersService.findActiveUsers(verify.id);
        const payload = {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          roleId: user.role.id,
          officeId: user.office.id,
        };
        return {
          token: this.jwtService.sign(payload),
          refreshToken: this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES,
          }),
          user,
        };
      }
    } catch (e) {
      throw new BadRequestException('Invalid token');
    }
  }

  async profile(id: string) {
    return await this.usersService.findOne(id);
  }
}
