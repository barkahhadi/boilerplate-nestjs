import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  findAll(params?: any) {
    return true;
  }

  list() {
    return this.prisma.permission.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new BadRequestException(['Permission not found']);
    }
    return permission;
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const permissionIsExists = await this.prisma.permission.findUnique({
      where: { id: createPermissionDto.id },
    });
    if (permissionIsExists) {
      throw new BadRequestException([
        'Permission ' + createPermissionDto.id + ' already exists',
      ]);
    }
    return this.prisma.permission.create({
      data: {
        ...createPermissionDto,
      },
    });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const permissionIsExists = await this.prisma.permission.findFirst({
      where: { id: updatePermissionDto.id, NOT: { id } },
    });

    if (permissionIsExists) {
      throw new BadRequestException([
        'Permission ' + updatePermissionDto.id + ' already exists',
      ]);
    }
    return this.prisma.permission.update({
      where: {
        id,
      },
      data: {
        ...updatePermissionDto,
      },
    });
  }

  async remove(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new BadRequestException(['Permission not found']);
    }
    return this.prisma.permission.delete({
      where: {
        id,
      },
    });
  }
}
