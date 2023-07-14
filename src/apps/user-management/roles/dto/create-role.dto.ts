import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Role id is required' })
  id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  defaultRoute: string | null;

  @ApiProperty()
  permissions: Prisma.JsonValue | null;
}
