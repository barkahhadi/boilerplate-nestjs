import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CaslAbilityFactory } from '@utils/casl/casl-ability.factory';
import { PermissionsGuard } from '@utils/casl/permissions.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, CaslAbilityFactory, PermissionsGuard],
  exports: [UsersService],
})
export class UsersModule {}
