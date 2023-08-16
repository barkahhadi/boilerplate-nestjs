import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  getSchemaPath,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CheckPermissions,
  PermissionsGuard,
  Permissions,
} from '@utils/casl/permissions.guard';
import { JwtAuthGuard } from '@apps/auth/guards/jwt-auth.guard';
import { DataTableDto } from '@/utils/datatable/datatable.dto';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'user-management:users'])
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(UserEntity),
        },
        total: {
          type: 'number',
        },
      },
    },
  })
  findAll(@Query() query: DataTableDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'user-management:users'])
  @ApiOkResponse({ type: UserEntity })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.CREATE, 'user-management:users'])
  @ApiCreatedResponse({ type: UserEntity })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch('change-password/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.UPDATE, 'user-management:users'])
  @ApiOkResponse({ type: UserEntity })
  updatePassword(@Param('id') id: string, @Body() data: any) {
    if (!data.password) {
      throw new BadRequestException('Password is required');
    }
    return this.usersService.update(id, {
      password: data?.password,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.UPDATE, 'user-management:users'])
  @ApiOkResponse({ type: UserEntity })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserEntity })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.DELETE, 'user-management:users'])
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
