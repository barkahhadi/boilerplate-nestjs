import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateUserRoleDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Zone ID is required' })
  zoneId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Roles is required' })
  roles: Prisma.JsonValue;
}
