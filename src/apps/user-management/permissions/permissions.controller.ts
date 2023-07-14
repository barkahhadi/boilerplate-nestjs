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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from './entities/permission.entity';
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

@Controller('permissions')
@ApiTags('Permissions')
@ApiBearerAuth('JWT')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'permissions'])
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(PermissionEntity),
        },
        total: {
          type: 'number',
        },
      },
    },
  })
  findAll(@Query() query: any) {
    return this.permissionsService.findAll(query);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  list() {
    return this.permissionsService.list();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'permissions'])
  @ApiOkResponse({ type: PermissionEntity })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.CREATE, 'permissions'])
  @ApiCreatedResponse({ type: PermissionEntity })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.UPDATE, 'permissions'])
  @ApiOkResponse({ type: PermissionEntity })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.DELETE, 'permissions'])
  @ApiOkResponse({ type: PermissionEntity })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
