import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Permission id is required' })
  id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Permission name is required' })
  name: string;
}
