import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getManager } from 'typeorm';
import { Category } from 'src/entity/category.entity';
import * as _ from 'lodash';

@Injectable()
export class PossessionGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const props = Object.getOwnPropertyNames(req.params);
    const manager = getManager();
    const tableName = this._reflector.get<string[]>(
      'entity',
      context.getClass(),
    );
    const method = this._reflector.get<string[]>(
      'methods',
      context.getHandler(),
    );
    console.log('method', method);

    const data = await manager.query(
      `SELECT * FROM ${tableName[0]} WHERE ${props} = '${
        req.params[props[0]]
      }'`,
    );

    if (_.indexOf(req.scopePermission, 'ANY') < 0) {
      console.log('cate poess', data);
      console.log('current User', req.user.users.id);

      return data[0].userId === req.user.users.id;
    }
    return true;
  }
}
