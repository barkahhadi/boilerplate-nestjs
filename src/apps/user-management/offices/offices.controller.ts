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
import { OfficesService } from './offices.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { OfficeEntity } from './entities/offices.entity';
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
import { DataTableDto } from '@/utils/DataTable/DataTable.dto';

@Controller('offices')
@ApiTags('Offices')
@ApiBearerAuth('JWT')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'user-management:offices'])
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(OfficeEntity),
        },
        total: {
          type: 'number',
        },
      },
    },
  })
  findAll(@Query() query: DataTableDto) {
    return this.officesService.findAll(query);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  list() {
    return this.officesService.list();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'user-management:offices'])
  @ApiOkResponse({ type: OfficeEntity })
  findOne(@Param('id') id: string) {
    return this.officesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.CREATE, 'user-management:offices'])
  @ApiCreatedResponse({ type: OfficeEntity })
  create(@Body() createOfficeDto: CreateOfficeDto) {
    return this.officesService.create(createOfficeDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.UPDATE, 'user-management:offices'])
  @ApiOkResponse({ type: OfficeEntity })
  update(@Param('id') id: string, @Body() updateOfficeDto: UpdateOfficeDto) {
    return this.officesService.update(id, updateOfficeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.DELETE, 'user-management:offices'])
  @ApiOkResponse({ type: OfficeEntity })
  remove(@Param('id') id: string) {
    return this.officesService.remove(id);
  }
}
