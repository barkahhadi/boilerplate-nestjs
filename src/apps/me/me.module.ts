import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { CaslAbilityFactory } from '@utils/casl/casl-ability.factory';
import { PermissionsGuard } from '@utils/casl/permissions.guard';
import { UsersService } from '@apps/user-management/users/users.service';

@Module({
  controllers: [MeController],
  providers: [UsersService, CaslAbilityFactory, PermissionsGuard],
})
export class MeModule {}
