import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
const officeSeeder = async (tx) => {
  await tx.office.createMany({
    data: [
      {
        id: 'HO-1',
        name: 'Head Office',
        isActive: true,
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
        officeId: 'HO-1',
      },
    ],
  });
};

async function main() {
  await prisma.$transaction(async (tx) => {
    await roleSeeder(tx);
    await officeSeeder(tx);
    await userSeeder(tx);
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
