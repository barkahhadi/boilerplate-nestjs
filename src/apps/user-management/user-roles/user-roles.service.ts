import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UserRolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: any) {
    return true;
  }

  async findOne(id: string) {
    const userRole = await this.prisma.userRole.findUnique({ where: { id } });
    if (!userRole) {
      throw new BadRequestException(['UserRole not found']);
    }
    return userRole;
  }

  async create(createUserRoleDto: CreateUserRoleDto) {
    const userRoleIsExists = await this.prisma.userRole.findFirst({
      where: {
        userId: createUserRoleDto.userId,
        zoneId: createUserRoleDto.zoneId,
      },
    });

    if (userRoleIsExists) {
      throw new BadRequestException(['User Role already exists']);
    }

    const userRole = await this.prisma.userRole.create({
      data: {
        ...createUserRoleDto,
      },
    });

    await this.updateUserRole(userRole);

    return userRole;
  }

  async update(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    const userRoleIsExists = await this.prisma.userRole.findFirst({
      where: {
        userId: updateUserRoleDto.userId,
        zoneId: updateUserRoleDto.zoneId,
        NOT: { id },
      },
    });

    if (userRoleIsExists) {
      throw new BadRequestException(['User Role already exists']);
    }

    const userRole: any = await this.prisma.userRole.update({
      where: {
        id,
      },
      data: {
        ...updateUserRoleDto,
      },
    });

    await this.updateUserRole(userRole);

    return userRole;
  }

  async updateUserRole(userRole: any) {
    if (userRole && userRole.roles.length > 0) {
      await this.prisma.user.update({
        where: {
          id: userRole.userId,
        },
        data: {
          roleId: userRole.roles[0],
        },
      });
    } else {
      await this.prisma.user.update({
        where: {
          id: userRole.userId,
        },
        data: {
          role: null,
        },
      });
    }
  }

  async remove(id: string) {
    return this.prisma.userRole.delete({
      where: {
        id,
      },
    });
  }
}
