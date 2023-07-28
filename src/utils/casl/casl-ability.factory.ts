import { Ability, AbilityBuilder } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { UsersService } from '@apps/user-management/users/users.service';
import {
  Permissions,
  PermissionObjectType,
  AppAbility,
  CaslPermission,
  AppPermission,
} from './permissions.decorator';

@Injectable()
export class CaslAbilityFactory {
  constructor(private readonly userService: UsersService) {}
  async createForUser(roleId: string): Promise<AppAbility> {
    const dbPermissions: AppPermission[] =
      (await this.userService.getAllPermissions(
        roleId,
      )) as Array<AppPermission>;

    const caslPermissions: CaslPermission[] = [];
    dbPermissions.forEach((p: AppPermission) => {
      const application = p.application;
      p.ability.forEach((a) => {
        const module = a.module;
        const listPermission = a.permissions;

        for (const perm in listPermission) {
          caslPermissions.push({
            action: listPermission[perm] as Permissions,
            subject: application + ':' + module,
          });
        }
      });
    });
    return new Ability<[Permissions, PermissionObjectType]>(caslPermissions);
  }
}
