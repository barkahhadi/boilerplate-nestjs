import { Global, Module } from '@nestjs/common';
import { UsersService } from '@apps/user-management/users/users.service';
import { CaslAbilityFactory } from './casl-ability.factory';
import { PermissionsGuard } from './permissions.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [CaslAbilityFactory, PermissionsGuard, UsersService],
  exports: [CaslAbilityFactory, PermissionsGuard],
})
export class CaslModule {}
