import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { DataTableDto } from '@/utils/DataTable/DataTable.dto';
import { DataTableService } from '@/utils/DataTable/DataTable.service';

@Injectable()
export class OfficesService {
  constructor(
    private prisma: PrismaService,
    private dataTable: DataTableService,
  ) {}

  findAll(params?: DataTableDto) {
    this.dataTable.fromQuery(
      `
      SELECT o."id", o."name", o."phone", o."address", o."latitude", o."longitude", o."isActive", o."createdAt" FROM offices o`,
      {
        orderableColumn: ['id', 'name', 'address', 'createdAt'],
        searchableColumn: ['id', 'name', 'phone', 'address'],
      },
      {
        ...params,
      },
    );

    return this.dataTable.execute();
  }

  async findOne(id: string) {
    const office = await this.prisma.office.findUnique({ where: { id } });
    if (!office) {
      throw new BadRequestException(['Office not found']);
    }
    return office;
  }

  async list() {
    return this.prisma.office.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async create(createOfficeDto: CreateOfficeDto) {
    const officeIsExists = await this.prisma.office.findUnique({
      where: { id: createOfficeDto.id },
    });

    if (officeIsExists) {
      throw new BadRequestException([
        'Office ' + createOfficeDto.id + ' already exists',
      ]);
    }

    return this.prisma.office.create({
      data: {
        ...createOfficeDto,
      },
    });
  }

  async update(id: string, updateOfficeDto: UpdateOfficeDto) {
    const officeIsExists = await this.prisma.office.findFirst({
      where: { id: updateOfficeDto.id, NOT: { id } },
    });

    if (officeIsExists) {
      throw new BadRequestException([
        'Office ' + updateOfficeDto.id + ' already exists',
      ]);
    }

    return this.prisma.office.update({
      where: {
        id,
      },
      data: {
        ...updateOfficeDto,
      },
    });
  }

  async remove(id: string) {
    const office = await this.prisma.office.findUnique({ where: { id } });
    if (!office) {
      throw new BadRequestException(['Office not found']);
    }
    return this.prisma.office.delete({
      where: {
        id,
      },
    });
  }
}
