import { SetMetadata } from '@nestjs/common';
import { Roles } from '../enums/roles.enum';

export const ROLES_KEY = 'roles';
export const UseRoles = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
