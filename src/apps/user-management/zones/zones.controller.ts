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
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { ZoneEntity } from './entities/zone.entity';
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

@Controller('zones')
@ApiTags('Zones')
@ApiBearerAuth('JWT')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'zones'])
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ZoneEntity),
        },
        total: {
          type: 'number',
        },
      },
    },
  })
  findAll(@Query() query: any) {
    return this.zonesService.findAll(query);
  }

  @Get('level')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  listLevel() {
    return this.zonesService.listLevel();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.READ, 'zones'])
  @ApiOkResponse({ type: ZoneEntity })
  findOne(@Param('id') id: string) {
    return this.zonesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.CREATE, 'zones'])
  @ApiCreatedResponse({ type: ZoneEntity })
  create(@Body() createZoneDto: CreateZoneDto) {
    return this.zonesService.create(createZoneDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.UPDATE, 'zones'])
  @ApiOkResponse({ type: ZoneEntity })
  update(@Param('id') id: string, @Body() updateZoneDto: UpdateZoneDto) {
    return this.zonesService.update(id, updateZoneDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @CheckPermissions([Permissions.DELETE, 'zones'])
  @ApiOkResponse({ type: ZoneEntity })
  remove(@Param('id') id: string) {
    return this.zonesService.remove(id);
  }
}
