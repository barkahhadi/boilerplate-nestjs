import { Ability } from '@casl/ability';

export enum Permissions {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export type PermissionObjectType = any;
export type AppAbility = Ability<[Permissions, PermissionObjectType]>;
export interface CaslPermission {
  action: Permissions;
  subject: string;
}

export interface ModulePermission {
  module: string;
  permissions: Array<Permissions>;
}

export interface AppPermission {
  application: string;
  access: Array<ModulePermission>;
}
export type RequiredPermission = [Permissions, PermissionObjectType];
export const PERMISSION_CHECKER_KEY = 'permission_checker_params_key';
