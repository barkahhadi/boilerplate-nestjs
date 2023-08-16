import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import globalModule from '@/global-module';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DataTableDto } from '@/utils/datatable/datatable.dto';

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

const mockRolesService = {
  findAll: jest.fn().mockResolvedValue({
    data: [roleData],
    total: 1,
  }),
  findOne: jest.fn().mockImplementation((id: string) => {
    return roleData;
  }),
  create: jest.fn().mockImplementation((createRoleDto: CreateRoleDto) => {
    return roleData;
  }),
  update: jest
    .fn()
    .mockImplementation((id: string, updateRoleDto: UpdateRoleDto) => {
      return roleData;
    }),
  remove: jest.fn().mockResolvedValue(roleData),
};

describe('RolesController', () => {
  let controller: RolesController;
  let roleService: RolesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: globalModule,
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    roleService = module.get<RolesService>(RolesService);
  });

  describe('findAll', () => {
    it('should find all roles', async () => {
      const result = {
        data: [roleData],
        total: 1,
      };
      const params: DataTableDto = {
        page: 1,
        perPage: 10,
      };

      expect(await controller.findAll(params)).toEqual(result);
    });
  });
  describe('findOne', () => {
    it('should find one role', async () => {
      const result = roleData;

      expect(await controller.findOne(roleData.id)).toEqual(result);
    });
  });
  describe('create', () => {
    it('should create role', async () => {
      const result = roleData;
      const createRoleDto: CreateRoleDto = {
        ...roleData,
      };

      expect(await controller.create(createRoleDto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update role', async () => {
      const result = roleData;
      const updateRoleDto: UpdateRoleDto = {
        ...roleData,
      };

      expect(await controller.update(roleData.id, updateRoleDto)).toEqual(
        result,
      );
    });
  });
  describe('remove', () => {
    it('should remove role', async () => {
      const result = roleData;

      expect(await controller.remove(roleData.id)).toEqual(result);
    });
  });
});
