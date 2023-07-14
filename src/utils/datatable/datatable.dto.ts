import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import {
  DatatableParams,
  DatatableOrderType,
  DatatableFilterParams,
  DatatableFilterDateBetween,
} from './datatable.service';

export class DatatableDto implements DatatableParams {
  @ApiProperty()
  page: number = 1;

  @ApiProperty()
  @ApiPropertyOptional()
  perPage?: number = 10;

  @ApiPropertyOptional()
  order?: string = null;

  @ApiPropertyOptional()
  orderType?: DatatableOrderType = null;

  @ApiPropertyOptional()
  search?: string = null;

  @ApiPropertyOptional()
  filter?: DatatableFilterParams[];

  @ApiPropertyOptional()
  filterDateBetween?: DatatableFilterDateBetween;
}
