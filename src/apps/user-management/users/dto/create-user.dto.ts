import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty()
  @IsOptional()
  phone: string | null;

  @ApiProperty()
  @IsOptional()
  address: string | null;

  @ApiProperty()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  @IsOptional()
  isActive: boolean;

  @ApiProperty()
  @IsNotEmpty({ message: 'Role is required' })
  roleId: string | null;

  @ApiProperty()
  zoneId: string | null;
}
