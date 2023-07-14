import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity implements User {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  password: string;

  @ApiProperty()
  phone: string | null;

  @ApiProperty()
  address: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  roleId: string | null;

  @ApiProperty()
  zoneId: string | null;

  @ApiProperty()
  isVerified: boolean;

  verificationCode: string | null;

  verificationExpiredAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
