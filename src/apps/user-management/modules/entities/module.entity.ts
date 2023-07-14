import { Module } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ModuleEntity implements Module {
  @ApiProperty()
  id: string;

  @ApiProperty()
  applicationId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
