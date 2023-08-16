import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
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
import { APPLICATIONS } from '@/constants/applications';

@Controller('roles')
@ApiTags('Roles')
@ApiBearerAuth('JWT')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'user-management:roles'])
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(RoleEntity),
        },
        total: {
          type: 'number',
        },
      },
    },
  })
  findAll(@Query() query: DataTableDto) {
    return this.rolesService.findAll(query);
  }

  @Get('applications')
  @UseGuards(JwtAuthGuard)
  listApplication() {
    return APPLICATIONS;
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  list() {
    return this.rolesService.list();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'user-management:roles'])
  @ApiOkResponse({ type: RoleEntity })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.CREATE, 'user-management:roles'])
  @ApiCreatedResponse({ type: RoleEntity })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.UPDATE, 'user-management:roles'])
  @ApiOkResponse({ type: RoleEntity })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.DELETE, 'user-management:roles'])
  @ApiOkResponse({ type: RoleEntity })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
