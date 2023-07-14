import { UserRole, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserRoleEntity implements UserRole {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  zoneId: string;

  @ApiProperty()
  roles: Prisma.JsonValue;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
