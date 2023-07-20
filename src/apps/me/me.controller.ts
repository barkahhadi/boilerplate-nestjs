import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from '@apps/user-management/users/users.service';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '@apps/auth/guards/jwt-auth.guard';
import { UserEntity } from '@apps/user-management/users/entities/user.entity';
import { UpdateUserDto } from '@apps/user-management/users/dto/update-user.dto';
import { ChangePasswordDto } from '@apps/user-management/users/dto/change-password.dto';

@Controller('me')
@ApiTags('Me')
@ApiBearerAuth('JWT')
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/permissions')
  @UseGuards(JwtAuthGuard)
  getPermissions(@Request() req) {
    return this.usersService.getAllPermissions(req.user.role);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    schema: {
      type: 'object',
      example: {
        id: 'string',
        username: 'string',
        email: 'string',
        name: 'string',
        role: {
          slug: 'string',
          name: 'string',
          defaultRoute: 'string',
        },
        zone: {
          code: 'string',
          name: 'string',
        },
      },
    },
  })
  getProfile(@Request() req) {
    return this.usersService.findActiveUsers(req.user.id);
  }

  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserEntity })
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(
      req.user.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserEntity })
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }
}
