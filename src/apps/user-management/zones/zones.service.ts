import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@utils/prisma/prisma.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';

@Injectable()
export class ZonesService {
  constructor(private prisma: PrismaService) {}

  findAll(params?: any) {
    return true;
  }

  async findOne(id: string) {
    const zone = await this.prisma.zone.findUnique({ where: { id } });
    if (!zone) {
      throw new BadRequestException(['Zone not found']);
    }
    return zone;
  }

  async create(createZoneDto: CreateZoneDto) {
    const zoneIsExists = await this.prisma.zone.findUnique({
      where: { id: createZoneDto.id },
    });

    if (zoneIsExists) {
      throw new BadRequestException([
        'Zone ' + createZoneDto.id + ' already exists',
      ]);
    }

    return this.prisma.zone.create({
      data: {
        ...createZoneDto,
      },
    });
  }

  async update(id: string, updateZoneDto: UpdateZoneDto) {
    const zoneIsExists = await this.prisma.zone.findFirst({
      where: { id: updateZoneDto.id, NOT: { id } },
    });

    if (zoneIsExists) {
      throw new BadRequestException([
        'Zone ' + updateZoneDto.id + ' already exists',
      ]);
    }

    return this.prisma.zone.update({
      where: {
        id,
      },
      data: {
        ...updateZoneDto,
      },
    });
  }

  async remove(id: string) {
    const zone = await this.prisma.zone.findUnique({ where: { id } });
    if (!zone) {
      throw new BadRequestException(['Zone not found']);
    }
    return this.prisma.zone.delete({
      where: {
        id,
      },
    });
  }

  async listLevel() {
    return [
      { value: 'HO', text: 'HO' },
      { value: 'Branch', text: 'Branch' },
      { value: 'Sub Branch', text: 'Sub Branch' },
    ];
  }
}
