import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { RolePermission } from 'src/entity/role_permission.entity';
import { RolePermissionRepository } from './rolePermission.repository';

@Injectable()
export class PermissionService {
  constructor(private repository: RolePermissionRepository) {}
}
