import { Role, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RoleEntity implements Role {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  defaultRoute: string | null;

  @ApiProperty()
  permissions: Prisma.JsonValue | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
