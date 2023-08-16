import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from '@apps/user-management/roles/roles.module';
import { UsersModule } from '@apps/user-management/users/users.module';
import { AuthModule } from '@apps/auth/auth.module';
import { MeModule } from '@apps/me/me.module';
import globalModule from './global-module';

@Module({
  imports: [...globalModule, RolesModule, UsersModule, AuthModule, MeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
