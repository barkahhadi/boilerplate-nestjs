import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import {
  DataTableParams,
  DataTableOrderType,
  DataTableFilterParams,
  DataTableFilterDateBetween,
} from './DataTable.service';

export class DataTableDto implements DataTableParams {
  @ApiProperty()
  page: number = 1;

  @ApiProperty()
  @ApiPropertyOptional()
  perPage?: number = 10;

  @ApiPropertyOptional()
  order?: string = null;

  @ApiPropertyOptional()
  orderType?: DataTableOrderType = null;

  @ApiPropertyOptional()
  search?: string = null;

  @ApiPropertyOptional()
  filter?: any;

  @ApiPropertyOptional()
  filterDateBetween?: DataTableFilterDateBetween;
}
