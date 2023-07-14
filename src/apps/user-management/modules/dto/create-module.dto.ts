import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Module id is required' })
  id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Application id is required' })
  applicationId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Module name is required' })
  name: string;

  @ApiProperty()
  description: string | null;
}
