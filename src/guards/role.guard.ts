import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as _ from 'lodash';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    // console.log();
    const req = context.switchToHttp().getRequest();
    const module = this._reflector.get<string[]>('modules', context.getClass());
    const method = this._reflector.get<string[]>(
      'methods',
      context.getHandler(),
    );
    let scopePermission = null;
    console.log('req', req.user);

    switch (req.user.users.role) {
      case 'MODERATOR': {
        if (method[0] === 'Update' || method[0] === 'Delete') {
          scopePermission = `${_.toUpper(req.user.users.role)}_${_.toUpper(
            method[0],
          )}_OWN_${_.toUpper(module[0])}`;
        } else {
          scopePermission = `${_.toUpper(req.user.users.role)}_${_.toUpper(
            method[0],
          )}_ANY_${_.toUpper(module[0])}`;
        }
        break;
      }
      case 'ADMIN': {
        scopePermission = `${_.toUpper(req.user.users.role)}_${_.toUpper(
          method[0],
        )}_ANY_${_.toUpper(module[0])}`;
      }
    }
    console.log('scope', scopePermission);

    return _.includes(req.user.permission, scopePermission);
  }
}
