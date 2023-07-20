import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DataTableDto } from '@/utils/DataTable/DataTable.dto';
import { DataTableService } from '@/utils/DataTable/DataTable.service';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private dataTable: DataTableService,
  ) {}

  findAll(params?: DataTableDto) {
    this.dataTable.fromQuery(
      `
      SELECT r."id", r."name", r."description", r."createdAt" FROM roles r`,
      {
        orderableColumn: ['id', 'name', 'description', 'createdAt'],
        searchableColumn: ['id', 'name', 'description'],
      },
      {
        ...params,
      },
    );

    return this.dataTable.execute();
  }

  list() {
    return this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new BadRequestException('Role not found');
    }
    return role;
  }

  async create(createRoleDto: CreateRoleDto) {
    const roleIsExists = await this.prisma.role.findUnique({
      where: { id: createRoleDto.id },
    });

    if (roleIsExists) {
      throw new BadRequestException(
        'Role ' + createRoleDto.id + ' already exists',
      );
    }

    return this.prisma.role.create({
      data: {
        ...createRoleDto,
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const roleIsExists = await this.prisma.role.findFirst({
      where: { id: updateRoleDto.id, NOT: { id } },
    });

    if (roleIsExists) {
      throw new BadRequestException(
        'Role ' + updateRoleDto.id + ' already exists',
      );
    }

    return this.prisma.role.update({
      where: {
        id,
      },
      data: {
        ...updateRoleDto,
      },
    });
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new BadRequestException('Role not found');
    }
    return this.prisma.role.delete({
      where: {
        id,
      },
    });
  }
}
