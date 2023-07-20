import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateOfficeDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Office id is required' })
  id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Office name is required' })
  name: string;

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
