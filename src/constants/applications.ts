import { Permissions } from '@/constants/permissions';

export interface Module {
  id: string;
  name: string;
  ability?: Permissions[]; // Update the type of ability to an array of Permissions
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  modules: Module[];
}

export const APPLICATIONS: Application[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'View dashboard',
    modules: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        ability: [Permissions.READ],
      },
    ],
  },
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Manage users and roles',
    modules: [
      {
        id: 'users',
        name: 'Users',
        ability: [
          Permissions.CREATE,
          Permissions.READ,
          Permissions.UPDATE,
          Permissions.DELETE,
          Permissions.RESET_PASSWORD,
        ],
      },
      {
        id: 'roles',
        name: 'Roles',
        ability: [
          Permissions.CREATE,
          Permissions.READ,
          Permissions.UPDATE,
          Permissions.DELETE,
        ],
      },
      {
        id: 'offices',
        name: 'Offices',
        ability: [
          Permissions.CREATE,
          Permissions.READ,
          Permissions.UPDATE,
          Permissions.DELETE,
        ],
      },
    ],
  },
];
