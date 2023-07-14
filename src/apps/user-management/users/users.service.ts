import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as bcrypt from 'bcrypt';
import config from '@configs/index';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll(params?: any) {
    return true;
  }

  findActiveUsers(id: string) {
    return this.prisma.user.findFirst({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: {
          select: {
            id: true,
            name: true,
            defaultRoute: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: { id, isActive: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (user) {
      delete user.password;
    }

    if (!user) {
      throw new BadRequestException(['User not found']);
    }
    return user;
  }

  async findByUsernameOrEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        roleId: true,
        zoneId: true,
        isActive: true,
        password: true,
        role: {
          select: {
            id: true,
            name: true,
            defaultRoute: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: { OR: [{ username: email }, { email }] },
    });

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const emailIsExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (emailIsExists) {
      throw new BadRequestException(['User with this email already exists']);
    }

    const usernameIsExists = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (usernameIsExists) {
      throw new BadRequestException(['User with this username already exists']);
    }

    // Hash password
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    const role = await this.prisma.role.findFirst({
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      throw new BadRequestException(['Role not found']);
    }

    const zone = await this.prisma.zone.findFirst({
      where: { id: 'HO-1' },
    });

    if (!zone) {
      throw new BadRequestException(['Zone not found']);
    }

    if (role.id != 'admin') {
      createUserDto.zoneId = zone.id;
    }

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
      },
    });

    if (role.id != 'admin') {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          zoneId: zone.id,
          roles: [role.id],
        },
      });
    }

    return user;
  }

  async setDefaultRoleAndZone(userId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: config.defaultRole },
    });

    const zone = await this.prisma.zone.findFirst({
      where: { id: config.defaultZone },
    });

    await this.prisma.userRole.create({
      data: {
        userId,
        zoneId: zone.id,
        roles: [role.id],
      },
    });

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        roleId: role.id,
        zoneId: zone.id,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email) {
      const emailIsExists = await this.prisma.user.findFirst({
        where: { email: updateUserDto.email, NOT: { id } },
      });

      if (emailIsExists) {
        throw new BadRequestException(['User with this email already exists']);
      }
    }

    if (updateUserDto.username) {
      const usernameIsExists = await this.prisma.user.findFirst({
        where: { username: updateUserDto.username, NOT: { id } },
      });

      if (usernameIsExists) {
        throw new BadRequestException([
          'User with this username already exists',
        ]);
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.roleId) {
      const role = await this.prisma.role.findFirst({
        where: { id: updateUserDto.roleId },
      });

      if (!role) {
        throw new BadRequestException(['Role not found']);
      }

      if (role.id != 'admin') {
        const zone = await this.prisma.zone.findFirst({
          where: { id: 'HO-1' },
        });

        // delete all userRole
        await this.prisma.userRole.deleteMany({
          where: { userId: id },
        });

        // create new userRole
        await this.prisma.userRole.create({
          data: {
            userId: id,
            zoneId: zone.id,
            roles: [role.id],
          },
        });
      }
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException(['User not found']);
    }

    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    });

    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async getAllPermissions(roleId: string): Promise<Array<any>> {
    const role = await this.prisma.role.findFirst({
      select: {
        id: true,
        permissions: true,
      },
      where: { id: roleId },
    });

    return role.permissions as Array<any>;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(['User not found']);
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException(['Old password is incorrect']);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  async getUserRoles(userId: string) {
    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const userRoles = await this.prisma.userRole.findMany({
      select: {
        id: true,
        roles: true,
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: { userId },
    });

    return userRoles.map((userRole) => {
      let roleData = null;
      if (userRole.roles) {
        const listRoles = userRole.roles as Array<string>;
        roleData = roles.filter((role) => listRoles.includes(role.id));
      }

      return {
        ...userRole,
        roles: roleData,
      };
    });
  }

  async switchRole(userId: string, zoneId: string, roleId: string) {
    const zone = await this.prisma.zone.findFirst({
      where: { id: zoneId },
    });
    const userRole = await this.prisma.userRole.findFirst({
      where: { userId, zoneId: zone.id },
    });

    if (!userRole) {
      throw new BadRequestException(['Role not found']);
    }

    const role = await this.prisma.role.findFirst({
      select: {
        id: true,
        name: true,
        defaultRoute: true,
      },
      where: { id: roleId },
    });

    const listRoles = userRole.roles as Array<string>;
    if (role && listRoles.includes(role.id)) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          roleId,
          zoneId,
        },
      });

      return role;
    } else {
      throw new BadRequestException(['Role not found']);
    }
  }

  async switchZone(userId: string, zoneId: string): Promise<any> {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        zone: {
          id: zoneId,
        },
      },
    });

    if (userRole && userRole.roles) {
      const role = await this.prisma.role.findFirst({
        select: {
          id: true,
          name: true,
          defaultRoute: true,
        },
        where: { id: userRole.roles[0] },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          zoneId,
          roleId: userRole.roles[0],
        },
      });

      return role;
    }

    return null;
  }
}
