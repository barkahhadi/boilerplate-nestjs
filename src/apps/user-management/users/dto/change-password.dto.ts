import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Prisma } from '@prisma/client';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Old password is required' })
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
}
