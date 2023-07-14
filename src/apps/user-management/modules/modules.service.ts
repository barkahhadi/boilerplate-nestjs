import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import {
  DatatableParams,
  DatatableService,
} from '@/utils/datatable/datatable.service';
import { DatatableDto } from '@/utils/datatable/datatable.dto';

@Injectable()
export class ModulesService {
  constructor(
    private prisma: PrismaService,
    private datatable: DatatableService,
  ) {}

  async findAll(params?: DatatableDto) {
    this.datatable.fromQuery(
      `
      SELECT m."id", m."name", a."name" as "applicationName", m."createdAt" FROM modules m JOIN applications a ON m."applicationId" = a.id `,
      {
        orderableColumn: ['id', 'name', 'applicationName', 'createdAt'],
        searchableColumn: ['name'],
      },
      {
        ...params,
      },
    );

    console.log(params);
    return this.datatable.execute();
  }

  list() {
    return this.prisma.module.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findOne(id: string) {
    const module = await this.prisma.module.findUnique({ where: { id } });
    if (!module) {
      throw new BadRequestException(['Module not found']);
    }
    return module;
  }

  async create(createModuleDto: CreateModuleDto) {
    const moduleIsExists = await this.prisma.module.findUnique({
      where: { id: createModuleDto.id },
    });

    if (moduleIsExists) {
      throw new BadRequestException([
        'Module ' + createModuleDto.id + ' already exists',
      ]);
    }

    return this.prisma.module.create({
      data: {
        ...createModuleDto,
      },
    });
  }

  async update(id: string, updateModuleDto: UpdateModuleDto) {
    const moduleIsExists = await this.prisma.module.findFirst({
      where: { id: updateModuleDto.id, NOT: { id } },
    });

    if (moduleIsExists) {
      throw new BadRequestException([
        'Module ' + updateModuleDto.id + ' already exists',
      ]);
    }

    return this.prisma.module.update({
      where: {
        id,
      },
      data: {
        ...updateModuleDto,
      },
    });
  }

  async remove(id: string) {
    const module = await this.prisma.module.findUnique({ where: { id } });
    if (!module) {
      throw new BadRequestException(['Module not found']);
    }

    return this.prisma.module.delete({
      where: {
        id,
      },
    });
  }
}
