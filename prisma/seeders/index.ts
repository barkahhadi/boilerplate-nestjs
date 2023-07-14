import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Permission seeders
const permissionSeeder = async (tx) => {
  await tx.permission.createMany({
    data: [
      {
        id: 'create',
        name: 'Create',
      },
      {
        id: 'read',
        name: 'Read',
      },
      {
        id: 'update',
        name: 'Update',
      },
      {
        id: 'delete',
        name: 'Delete',
      },
    ],
  });
};

// Role seeders
const roleSeeder = async (tx) => {
  const listOfPermissions = [
    {
      application: 'dashboard',
      access: [
        {
          module: 'dashboard',
          permissions: ['read'],
        },
      ],
    },
    {
      application: 'user-management',
      access: [
        {
          module: 'users',
          permissions: ['create', 'read', 'update', 'delete'],
        },
        {
          module: 'user-roles',
          permissions: ['create', 'read', 'update', 'delete'],
        },
        {
          module: 'roles',
          permissions: ['create', 'read', 'update', 'delete'],
        },
        {
          module: 'modules',
          permissions: ['create', 'read', 'update', 'delete'],
        },
        {
          module: 'permissions',
          permissions: ['create', 'read', 'update', 'delete'],
        },
        {
          module: 'zones',
          permissions: ['create', 'read', 'update', 'delete'],
        },
      ],
    },
  ];

  await tx.role.createMany({
    data: [
      {
        id: 'admin',
        name: 'Admin',
        description: 'Administrator',
        defaultRoute: '/',
        permissions: listOfPermissions,
      },
      {
        id: 'public',
        name: 'Public',
        description: 'Public',
        defaultRoute: '/',
        permissions: [],
      },
    ],
  });
};

// Zone seeders
const zoneSeeder = async (tx) => {
  await tx.zone.createMany({
    data: [
      {
        id: 'HO-1',
        name: 'Head Office',
        level: 'HO',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });
};

// Application seeders
const applicationSeeder = async (tx) => {
  await tx.application.createMany({
    data: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-management',
        name: 'User Management',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });
};

// Module seeders
const moduleSeeder = async (tx) => {
  await tx.module.createMany({
    data: [
      {
        id: 'dashboard',
        applicationId: 'dashboard',
        name: 'Dashboard',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'users',
        applicationId: 'user-management',
        name: 'Users',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user-roles',
        applicationId: 'user-management',
        name: 'User Roles',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'roles',
        applicationId: 'user-management',
        name: 'Roles',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'modules',
        applicationId: 'user-management',
        name: 'Modules',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'permissions',
        applicationId: 'user-management',
        name: 'Permissions',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'zones',
        applicationId: 'user-management',
        name: 'Zones',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });
};

const userSeeder = async (tx) => {
  const password = await bcrypt.hash('admin', 10);
  await tx.user.createMany({
    data: [
      {
        username: 'admin',
        email: 'admin@demo.com',
        password: password,
        name: 'Administrator',
        roleId: 'admin',
        zoneId: 'HO-1',
      },
    ],
  });
};

const userRoleSeeder = async (tx) => {
  const userAdmin = await tx.user.findUnique({
    where: {
      username: 'admin',
    },
  });
  const zoneHo = await tx.zone.findUnique({
    where: {
      id: 'HO-1',
    },
  });

  await tx.userRole.createMany({
    data: [
      {
        userId: userAdmin.id,
        zoneId: zoneHo.id,
        roles: ['admin'],
      },
    ],
  });
};

async function main() {
  await prisma.$transaction(async (tx) => {
    await permissionSeeder(tx);
    await roleSeeder(tx);
    await zoneSeeder(tx);
    await applicationSeeder(tx);
    await moduleSeeder(tx);
    await userSeeder(tx);
    await userRoleSeeder(tx);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
