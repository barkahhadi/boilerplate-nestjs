import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateZoneDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Zone id is required' })
  id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Zone name is required' })
  name: string;

  @ApiProperty()
  parentId: string | null;

  @ApiProperty()
  @IsNotEmpty({ message: 'Zone level is required' })
  level: string;

  @ApiProperty()
  phone: string | null;

  @ApiProperty()
  address: string | null;

  @ApiProperty()
  latitude: number | null;

  @ApiProperty()
  longitude: number | null;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
