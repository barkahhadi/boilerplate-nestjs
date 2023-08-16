import { Test, TestingModule } from '@nestjs/testing';
import { DataTableService, DataTableSettings } from './datatable.service';
import { PrismaModule } from '../prisma/prisma.module';

describe('DataTableService', () => {
  let dataTableService: DataTableService;

  beforeAll(async () => {
    const settings: DataTableSettings = {
      driver: 'postgresql',
      maxLimitPerPage: 1000,
      debugMode: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        {
          provide: 'DataTable_SETTINGS',
          useValue: settings,
        },
        DataTableService,
      ],
    }).compile();

    dataTableService = module.get<DataTableService>(DataTableService);
  });

  it('should be defined', () => {
    expect(dataTableService).toBeDefined();
  });

  it('should return correct query', () => {
    dataTableService.fromQuery('SELECT * FROM users', null, {
      page: 1,
      perPage: 10,
    });

    const { query, queryCount } = dataTableService.getQuery();

    expect(query).toEqual('SELECT * FROM users LIMIT 10 OFFSET 0');
    expect(queryCount).toEqual('SELECT COUNT(*) as total FROM users');
  });

  it('should parse search query correctly', () => {
    dataTableService.fromQuery(
      'SELECT u.id, u.name, u.email, r.name as roleName FROM users u JOIN roles r ON r.id=u.roleId',
      {
        searchableColumn: ['name', 'email', 'roleName'],
      },
      {
        page: 1,
        perPage: 10,
        search: 'admin',
      },
    );

    const { query, queryCount } = dataTableService.getQuery();

    expect(query).toEqual(
      `SELECT u.id, u.name, u.email, r.name as roleName FROM users u JOIN roles r ON r.id=u.roleId WHERE u.name ILIKE '%admin%' OR u.email ILIKE '%admin%' OR r.name ILIKE '%admin%' LIMIT 10 OFFSET 0`,
    );

    expect(queryCount).toEqual(
      `SELECT COUNT(*) as total FROM users u JOIN roles r ON r.id=u.roleId WHERE u.name ILIKE '%admin%' OR u.email ILIKE '%admin%' OR r.name ILIKE '%admin%'`,
    );
  });

  it('should parse order query correctly', () => {
    dataTableService.fromQuery(
      'SELECT u.id, u.name, u.email, r.name as roleName FROM users u JOIN roles r ON r.id=u.roleId',
      {
        orderableColumn: ['name', 'email', 'roleName'],
      },
      {
        page: 1,
        perPage: 10,
        order: 'roleName',
        orderType: 'desc',
      },
    );

    const { query, queryCount } = dataTableService.getQuery();

    expect(query).toEqual(
      `SELECT u.id, u.name, u.email, r.name as roleName FROM users u JOIN roles r ON r.id=u.roleId ORDER BY r.name DESC LIMIT 10 OFFSET 0`,
    );

    expect(queryCount).toEqual(
      `SELECT COUNT(*) as total FROM users u JOIN roles r ON r.id=u.roleId`,
    );
  });

  it('should parse filter query correctly', () => {
    dataTableService.fromQuery(
      'SELECT u.id, u.name, u.username, u.email, r.name as roleName FROM users u JOIN roles r ON r.id=u.roleId',
      {
        filterableColumn: ['email', 'username', 'roleName'],
      },
      {
        page: 1,
        perPage: 10,
        filter: {
          roleName: {
            eq: 'admin',
          },
          email: {
            iLike: 'admin@admin.com',
          },
          username: {
            notIn: ['admin', 'superadmin'],
          },
        },
      },
    );

    const { query, queryCount } = dataTableService.getQuery();

    expect(query).toEqual(
      `SELECT u.id, u.name, u.username, u.email, r.name as roleName FROM users u JOIN roles r ON r.id=u.roleId WHERE r.name = 'admin' AND u.email ILIKE '%admin@admin.com%' AND u.username NOT IN ('admin', 'superadmin') LIMIT 10 OFFSET 0`,
    );

    expect(queryCount).toEqual(
      `SELECT COUNT(*) as total FROM users u JOIN roles r ON r.id=u.roleId WHERE r.name = 'admin' AND u.email ILIKE '%admin@admin.com%' AND u.username NOT IN ('admin', 'superadmin')`,
    );
  });

  it('should parse query date between correctly', () => {
    dataTableService.fromQuery(
      'SELECT u.id, u.name, u.username, u.email, r.name as roleName, u.createdAt FROM users u JOIN roles r ON r.id=u.roleId',
      {
        filterableColumn: ['createdAt'],
      },
      {
        page: 1,
        perPage: 10,
        filterDateBetween: {
          start: '2021-01-01',
          end: '2021-01-31',
          column: 'createdAt',
        },
      },
    );

    const { query, queryCount } = dataTableService.getQuery();

    expect(query).toEqual(
      `SELECT u.id, u.name, u.username, u.email, r.name as roleName, u.createdAt FROM users u JOIN roles r ON r.id=u.roleId WHERE u.createdAt BETWEEN '2021-01-01' AND '2021-01-31' LIMIT 10 OFFSET 0`,
    );

    expect(queryCount).toEqual(
      `SELECT COUNT(*) as total FROM users u JOIN roles r ON r.id=u.roleId WHERE u.createdAt BETWEEN '2021-01-01' AND '2021-01-31'`,
    );
  });
});
