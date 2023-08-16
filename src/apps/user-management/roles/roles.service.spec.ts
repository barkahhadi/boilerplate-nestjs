import { RolesService } from './roles.service';
import { Test, TestingModule } from '@nestjs/testing';
import globalModule from '@/global-module';
import { PrismaService } from '@/utils/prisma/prisma.service';
import { DataTableService } from '@/utils/DataTable/DataTable.service';

const roleData = {
  id: 'admin',
  name: 'Administrator',
  description: 'Admin Role',
  defaultRoute: null,
  permissions: [
    {
      name: 'role-management',
      description: 'Role Management',
      permissions: [
        {
          application: 'role-management',
          ability: [
            {
              module: 'roles',
              permissions: ['create', 'update', 'delete', 'read'],
            },
            { module: 'roles', permissions: ['create', 'read', 'update'] },
            {
              module: 'offices',
              permissions: ['create', 'read', 'update', 'delete'],
            },
          ],
        },
      ],
    },
  ],
};

describe('RolesService', () => {
  let service: RolesService;
  let dataTable: DataTableService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: globalModule,
      providers: [RolesService],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);
    dataTable = module.get<DataTableService>(DataTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all roles', async () => {
      dataTable.executeQuery = jest.fn().mockResolvedValue({
        data: [roleData],
        total: 1,
      });
      const result = await service.findAll({
        page: 1,
        perPage: 10,
      });

      expect(result).toEqual({
        data: [roleData],
        total: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should find one role', async () => {
      prisma.role.findUnique = jest.fn().mockResolvedValue(roleData);
      const result = await service.findOne(roleData.id);
      expect(result).toEqual(roleData);
    });
  });

  describe('create', () => {
    it('should throw duplicate error when create role', async () => {
      prisma.role.findUnique = jest.fn().mockResolvedValue('admin');

      // shold be error
      await expect(
        service.create({
          ...roleData,
        }),
      ).rejects.toThrowError();
    });

    it('should create role', async () => {
      prisma.role.findUnique = jest.fn().mockResolvedValue(null);
      prisma.role.findFirst = jest.fn().mockResolvedValue({
        id: 'admin',
        name: 'Administrator',
      });

      prisma.role.create = jest.fn().mockResolvedValue(roleData);

      const result = await service.create({
        ...roleData,
      });

      expect(result).toEqual(roleData);
    });
  });

  describe('update', () => {
    it('should throw duplicate error when update role', async () => {
      prisma.role.findFirst = jest.fn().mockResolvedValue('admin@demo.com');

      // shold be error
      await expect(
        service.update(roleData.id, {
          ...roleData,
        }),
      ).rejects.toThrowError();
    });

    it('should update role', async () => {
      prisma.role.findFirst = jest.fn().mockResolvedValue(null);

      prisma.role.update = jest.fn().mockResolvedValue(roleData);

      const result = await service.update(roleData.id, {
        ...roleData,
      });

      expect(result).toEqual(roleData);
    });

    describe('remove', () => {
      it('should throw error role not found when delete role', async () => {
        prisma.role.findUnique = jest.fn().mockResolvedValue(null);

        await expect(service.remove(roleData.id)).rejects.toThrowError(
          'Role not found',
        );
      });

      it('should delete role', async () => {
        prisma.role.findUnique = jest.fn().mockResolvedValue(roleData);
        prisma.role.delete = jest.fn().mockResolvedValue(roleData);

        const result = await service.remove(roleData.id);

        expect(result).toEqual(roleData);
      });
    });
  });
});
