import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@utils/prisma/prisma.module';
import { OfficesModule } from '@/apps/user-management/offices/offices.module';
import { RolesModule } from '@apps/user-management/roles/roles.module';
import { UsersModule } from '@apps/user-management/users/users.module';
import { AuthModule } from '@apps/auth/auth.module';
import { CaslModule } from '@utils/casl/casl.module';
import { MeModule } from '@apps/me/me.module';
import { DataTableModule } from './utils/DataTable/DataTable.module';

@Module({
  imports: [
    DataTableModule.forRoot({
      driver: 'postgresql',
      debugMode: process.env.NODE_ENV === 'development',
      maxLimitPerPage: 1000,
    }),
    PrismaModule,
    OfficesModule,
    RolesModule,
    UsersModule,
    AuthModule,
    CaslModule,
    MeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
