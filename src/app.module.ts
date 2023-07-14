import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@utils/prisma/prisma.module';
import { ZonesModule } from '@apps/user-management/zones/zones.module';
import { RolesModule } from '@apps/user-management/roles/roles.module';
import { ModulesModule } from '@apps/user-management/modules/modules.module';
import { UsersModule } from '@apps/user-management/users/users.module';
import { UserRolesModule } from '@apps/user-management/user-roles/user-roles.module';
import { AuthModule } from '@apps/auth/auth.module';
import { PermissionsModule } from '@apps/user-management/permissions/permissions.module';
import { CaslModule } from '@utils/casl/casl.module';
import { MeModule } from '@apps/me/me.module';
import { DatatableModule } from './utils/datatable/datatable.module';

@Module({
  imports: [
    DatatableModule.forRoot({
      driver: 'postgresql',
      debugMode: process.env.NODE_ENV === 'development',
      maxLimitPerPage: 1000,
    }),
    PrismaModule,
    ZonesModule,
    RolesModule,
    ModulesModule,
    UsersModule,
    UserRolesModule,
    AuthModule,
    PermissionsModule,
    CaslModule,
    MeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
