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
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleEntity } from './entities/module.entity';
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
import { DatatableDto } from '@/utils/datatable/datatable.dto';

@Controller('modules')
@ApiTags('Modules')
@ApiBearerAuth('JWT')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'user-management:modules'])
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ModuleEntity),
        },
        total: {
          type: 'number',
        },
      },
    },
  })
  findAll(@Query() query: any) {
    return this.modulesService.findAll(query);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  list() {
    return this.modulesService.list();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'user-management:modules'])
  @ApiOkResponse({ type: ModuleEntity })
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.CREATE, 'user-management:modules'])
  @ApiCreatedResponse({ type: ModuleEntity })
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.create(createModuleDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.UPDATE, 'user-management:modules'])
  @ApiOkResponse({ type: ModuleEntity })
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.DELETE, 'user-management:modules'])
  @ApiOkResponse({ type: ModuleEntity })
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }
}
