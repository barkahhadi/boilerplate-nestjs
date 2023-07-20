import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as bcrypt from 'bcrypt';
import { DataTableService } from '@utils/DataTable/DataTable.service';
import { DataTableDto } from '@/utils/DataTable/DataTable.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private dataTable: DataTableService,
  ) {}

  findAll(params?: DataTableDto) {
    this.dataTable.fromQuery(
      `
      SELECT 
        u."id", u."username", u."email", u."name", u."isActive", u."roleId", u."officeId", u."createdAt",
        r."name" as "roleName",
        o."name" as "officeName"
      FROM users u LEFT JOIN roles r ON u."roleId" = r."id" 
      LEFT JOIN offices o ON u."officeId" = o."id"`,
      {
        orderableColumn: [
          'id',
          'username',
          'email',
          'name',
          'isActive',
          'createdAt',
          'roleName',
          'officeName',
        ],
        searchableColumn: [
          'id',
          'username',
          'email',
          'name',
          'roleName',
          'officeName',
        ],
        filterableColumn: ['isActive', 'roleId', 'officeId'],
      },
      {
        ...params,
      },
    );

    return this.dataTable.execute();
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
          },
        },
        office: {
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
        officeId: true,
        isActive: true,
        password: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        office: {
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
      throw new BadRequestException('User with this email already exists');
    }

    const usernameIsExists = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (usernameIsExists) {
      throw new BadRequestException('User with this username already exists');
    }

    // Hash password
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    if (createUserDto.roleId) {
      const role = await this.prisma.role.findFirst({
        where: { id: createUserDto.roleId },
      });

      if (!role) {
        throw new BadRequestException('Role not found');
      }
    }

    if (createUserDto.officeId) {
      const office = await this.prisma.office.findUnique({
        where: { id: createUserDto.officeId },
      });

      if (!office) {
        throw new BadRequestException('Office not found');
      }
    }

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
      },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email) {
      const emailIsExists = await this.prisma.user.findFirst({
        where: { email: updateUserDto.email, NOT: { id } },
      });

      if (emailIsExists) {
        throw new BadRequestException('User with this email already exists');
      }
    }

    if (updateUserDto.username) {
      const usernameIsExists = await this.prisma.user.findFirst({
        where: { username: updateUserDto.username, NOT: { id } },
      });

      if (usernameIsExists) {
        throw new BadRequestException('User with this username already exists');
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
        throw new BadRequestException('Role not found');
      }
    }

    if (updateUserDto.officeId) {
      const office = await this.prisma.office.findUnique({
        where: { id: updateUserDto.officeId },
      });

      if (!office) {
        throw new BadRequestException('Office not found');
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
}
