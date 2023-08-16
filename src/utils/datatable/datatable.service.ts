/*
 * Author: Barkah Hadi
 * Email: barkah.hadi@gmail.com
 * Last Modified: Fri Jul 14 2023 5:28:58 PM
 * File: DataTable.service.ts
 * Description: Service for Generating DataTable
 */

import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@utils/prisma/prisma.service';
import { type } from 'os';

export type DataTableOrderType = 'asc' | 'desc';

const operator = {
  eq: '=',
  ne: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  like: 'LIKE',
  notLike: 'NOT LIKE',
  iLike: 'ILIKE',
  notILike: 'NOT ILIKE',
  in: 'IN',
  notIn: 'NOT IN',
  between: 'BETWEEN',
  notBetween: 'NOT BETWEEN',
  isNull: 'IS NULL',
  isNotNull: 'IS NOT NULL',
};

export interface DataTableFilterDateBetween {
  start: string;
  end: string;
  column: string;
}

export interface DataTableFilterParams {
  [key: string]: {
    [key in string]: string | number | boolean | string[] | number[];
  };
}

export interface DataTableParams {
  order?: string;
  orderType?: DataTableOrderType;
  search?: string;
  page?: number;
  perPage?: number;
  filter?: DataTableFilterParams;
  filterDateBetween?: DataTableFilterDateBetween;
}

export interface DataTableSettings {
  searchableColumn?: string[];
  orderableColumn?: string[];
  filterableColumn?: string[];
  maxLimitPerPage?: number;
  driver?: 'postgresql' | 'mysql';
  debugMode?: boolean;
}

export interface DataTableResult {
  data: any[];
  total: number;
}

export interface DataTableColumn {
  name: string;
  alias: string;
}

@Injectable()
export class DataTableService {
  private selectQuery: string;
  private orderQuery: string;
  private searchQuery: string;
  private limitQuery: string;
  private filterQuery: string;
  private filterDateBetweenQuery: string;

  private settings: DataTableSettings;
  private params: DataTableParams;

  private isCustomQueryOrder: boolean;
  private isCustomQuerySearch: boolean;
  private isCustomQueryFilter: boolean;

  private columnMappping: DataTableColumn[];

  constructor(
    private prisma: PrismaService = null,
    @Inject('DataTable_SETTINGS') settings: DataTableSettings = null,
  ) {
    this.selectQuery = '';
    this.orderQuery = '';
    this.searchQuery = '';
    this.limitQuery = '';
    this.filterQuery = '';
    this.filterDateBetweenQuery = '';

    this.isCustomQueryOrder = false;
    this.isCustomQuerySearch = false;
    this.isCustomQueryFilter = false;
    this.settings = settings;
  }

  public fromQuery(
    sql: string,
    settings: DataTableSettings,
    params: DataTableParams,
  ) {
    this.reset();
    this.params = {
      page: 1,
      perPage: 10,
      ...params,
    };

    this.settings = {
      ...this.settings,
      ...settings,
    };

    sql = sql.replace(/\n/g, ' ');
    sql = sql.replace(/\s\s+/g, ' ').trim();

    this.transformSelectedColumnToArray(sql);
    this.selectQuery = sql;
  }

  public executeQuery(
    sql: string,
    settings: DataTableSettings,
    params: DataTableParams,
  ): Promise<DataTableResult> {
    this.fromQuery(sql, settings, params);
    return this.execute();
  }

  private transformSelectedColumnToArray(
    selectQuery: string,
  ): DataTableColumn[] {
    // remove SELECT or select word
    selectQuery = selectQuery.replace(/SELECT/gi, '');
    selectQuery = selectQuery.replace(/select/gi, '');

    // remove all string begins with FROM or from word
    selectQuery = selectQuery.split('FROM')[0];
    selectQuery = selectQuery.split('from')[0];

    const selectQueryArr = selectQuery.split(',');

    const selectQueryArrParsed: DataTableColumn[] = [];
    for (const selectQueryItem of selectQueryArr) {
      const selectQueryItemArr = selectQueryItem.trim().split(' ');
      let name = '';
      let alias = '';
      // if selectQueryItemArr includes as
      if (selectQueryItemArr.includes('as')) {
        const aliasIndex = selectQueryItemArr.indexOf('as');
        name = selectQueryItemArr[aliasIndex - 1];
        alias = selectQueryItemArr[aliasIndex + 1];
      } else {
        name = selectQueryItemArr[0];
        alias = selectQueryItemArr[0];
      }

      alias = alias.split('.')[1] || alias;
      alias = alias.replace(/"/g, '');

      selectQueryArrParsed.push({
        name,
        alias,
      });
    }

    this.columnMappping = selectQueryArrParsed;
    return selectQueryArrParsed;
  }

  public setQueryOrder(sql: string) {
    this.orderQuery = sql;
    this.isCustomQueryOrder = true;
  }

  private buildQueryOrder() {
    if (!this.params?.order) return '';

    const { order, orderType } = this.params;

    if (!order || !orderType) return '';

    if (!this.settings.orderableColumn) {
      throw new Error('Orderable column is not configured!');
    }

    if (!this.settings.orderableColumn.includes(order)) return '';

    this.orderQuery = ` ORDER BY ${this.parseColumn(
      order,
    )} ${orderType.toUpperCase()}`;
  }

  private parseColumn(strColumn) {
    // find in columnMapping where alias = strColumn
    const columnMapping = this.columnMappping.find(
      (column) => column.alias === strColumn,
    );

    if (!columnMapping) {
      // check if string begin and end with (")
      if (strColumn[0] === '"' && strColumn[strColumn.length - 1] === '"') {
        return strColumn;
      }
      // check if string contains (.)
      if (strColumn.includes('.')) {
        const arr = strColumn.split('.');
        arr[1] = `"${arr[1].replace(/"/g, '')}"`;
        return arr.join('.');
      } else {
        return `"${strColumn}"`;
      }
    }

    return columnMapping.name;
  }

  public setQuerySearch(sql: string) {
    this.searchQuery = sql;
    this.isCustomQuerySearch = true;
  }

  private buildQuerySearch() {
    if (!this.params?.search) return '';

    const { search } = this.params;

    if (!search) return '';

    if (!this.settings.searchableColumn) return '';

    const searchArrQuery: string[] = [];

    for (const searchColumn of this.settings.searchableColumn) {
      if (this.settings.driver === 'postgresql') {
        searchArrQuery.push(
          `${this.parseColumn(searchColumn)} ILIKE '%${search}%'`,
        );
      } else if (this.settings.driver === 'mysql') {
        searchArrQuery.push(
          `${this.parseColumn(searchColumn)} LIKE '%${search}%'`,
        );
      }
    }

    this.searchQuery = searchArrQuery.join(' OR ');
  }

  private buildQueryLimit() {
    if (!this.params?.page || !this.params?.perPage) return '';

    const { page, perPage } = this.params;

    if (!page || !perPage) return '';

    if (this.settings.maxLimitPerPage) {
      if (perPage > this.settings.maxLimitPerPage) {
        this.params.perPage = this.settings.maxLimitPerPage;
      }
    }

    const offset = (page - 1) * perPage;
    const limit = perPage;

    this.limitQuery = ` LIMIT ${limit} OFFSET ${offset}`;
  }

  public setQueryFilter(sql: string) {
    this.filterQuery = sql;
    this.isCustomQueryFilter = true;
  }

  private buildQueryFilter() {
    if (!this.params?.filter) return '';

    const { filter } = this.params;

    if (!filter) return '';

    const filterArrQuery: string[] = [];

    for (const column in filter) {
      if (!this.settings.filterableColumn) {
        throw new Error('Filterable column is not configured!');
      }

      if (!this.settings.filterableColumn.includes(column)) continue;

      for (const op in filter[column]) {
        if (!Object.keys(operator).includes(op)) {
          throw new Error(`Operator ${op} is not allowed!`);
        }
        const value = filter[column][op];

        if (['isNull', 'isNotNull'].includes(op)) {
          filterArrQuery.push(`${this.parseColumn(column)} ${operator[op]}`);
          continue;
        } else if (['in', 'notIn'].includes(op) && value instanceof Array) {
          filterArrQuery.push(
            `${this.parseColumn(column)} ${operator[op]} (${value
              .map((v) => "'" + v + "'")
              .join(', ')})`,
          );
          continue;
        } else if (
          ['between', 'notBetween'].includes(op) &&
          value instanceof Array
        ) {
          filterArrQuery.push(
            `${this.parseColumn(column)} ${operator[op]} '${value[0]}' AND '${
              value[1]
            }'`,
          );
          continue;
        } else if (
          ['like', 'notLike', 'iLike', 'notILike'].includes(op) &&
          typeof value === 'string'
        ) {
          filterArrQuery.push(
            `${this.parseColumn(column)} ${operator[op]} '%${value}%'`,
          );
          continue;
        } else if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          filterArrQuery.push(
            `${this.parseColumn(column)} ${operator[op]} '${value}'`,
          );
          continue;
        }
      }
    }

    this.filterQuery = filterArrQuery.join(' AND ');
  }

  private buildQueryFilterDateBetween() {
    if (!this.params?.filterDateBetween) return '';

    const { filterDateBetween } = this.params;

    if (!filterDateBetween) return '';

    if (!this.settings.filterableColumn.includes(filterDateBetween.column))
      return '';

    this.filterDateBetweenQuery = `${this.parseColumn(
      filterDateBetween.column,
    )} BETWEEN '${filterDateBetween.start}' AND '${filterDateBetween.end}'`;
  }

  private buildQuery(): string {
    if (!this.isCustomQuerySearch) {
      this.buildQuerySearch();
    }
    if (!this.isCustomQueryOrder) {
      this.buildQueryOrder();
    }
    if (!this.isCustomQueryFilter) {
      this.buildQueryFilter();
    }
    this.buildQueryLimit();
    this.buildQueryFilterDateBetween();

    let query = this.selectQuery;
    if (this.searchQuery || this.filterQuery || this.filterDateBetweenQuery) {
      query += ' WHERE ';
    }
    query += this.searchQuery;
    if (this.searchQuery && this.filterQuery) {
      query += ' AND ';
    }
    query += this.filterQuery;
    if ((this.searchQuery || this.filterQuery) && this.filterDateBetweenQuery) {
      query += ' AND ';
    }
    query += this.filterDateBetweenQuery;
    query += this.orderQuery;
    query += this.limitQuery;

    return query.replace(/\n/g, ' ').trim();
  }

  private removeSelectQueryAndReplaceWithCount() {
    let query = this.selectQuery;
    const selectQuery = query.split('FROM')[0];
    query = query.replace(selectQuery, 'SELECT COUNT(*) as total ');
    return query;
  }

  private buildQueryCount(): string {
    let query = this.removeSelectQueryAndReplaceWithCount();
    if (this.searchQuery || this.filterQuery || this.filterDateBetweenQuery) {
      query += ' WHERE ';
    }
    query += this.searchQuery;
    if (this.searchQuery && this.filterQuery) {
      query += ' AND ';
    }
    query += this.filterQuery;
    if ((this.searchQuery || this.filterQuery) && this.filterDateBetweenQuery) {
      query += ' AND ';
    }
    query += this.filterDateBetweenQuery;

    return query.trim();
  }

  public async execute(): Promise<DataTableResult> {
    if (!this.prisma) throw new Error('PrismaService is not defined');

    return await this.prisma.$transaction(async (prisma) => {
      const query = this.buildQuery();
      if (this.settings.debugMode) {
        console.info(query);
      }
      const result = (await prisma.$queryRaw(Prisma.raw(query))) as any[];

      const queryCount = this.buildQueryCount();
      if (this.settings.debugMode) {
        console.info(queryCount);
      }
      const resultCount = await prisma.$queryRaw(Prisma.raw(queryCount));

      return {
        data: result,
        total: resultCount[0].total,
      };
    });
  }

  public getQuery() {
    const query = this.buildQuery();
    const queryCount = this.buildQueryCount();

    return {
      query,
      queryCount,
    };
  }

  private reset() {
    this.selectQuery = '';
    this.orderQuery = '';
    this.searchQuery = '';
    this.limitQuery = '';
    this.filterQuery = '';
    this.filterDateBetweenQuery = '';

    this.isCustomQueryOrder = false;
    this.isCustomQuerySearch = false;
    this.isCustomQueryFilter = false;
  }
}
