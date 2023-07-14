import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthRefreshDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}
