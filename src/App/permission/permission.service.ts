import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermissionRepository } from './rolePermission.repository';
import { Role } from 'src/entity/role.entity';
import { Repository } from 'typeorm';
import * as _ from 'lodash';

@Injectable()
export class PermissionService {
  constructor(
    private repository: RolePermissionRepository,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async getRolesPermission(role: string) {
    try {
      const permissionRole = [];
      const rolePermissions = await this.roleRepository.findOne({
        where: { role },
        relations: [
          'rolePermission',
          'rolePermission.permission',
          'rolePermission.permission.method',
          'rolePermission.permission.module',
        ],
      });
      rolePermissions.rolePermission.forEach(permission => {
        const rolePermission = `${_.toUpper(rolePermissions.role)}_${_.toUpper(
          permission.permission.method.method,
        )}_${_.toUpper(permission.posession)}_${_.toUpper(
          permission.permission.module.module,
        )}`;
        permissionRole.push(rolePermission);
      });
      return permissionRole;
    } catch (error) {
      throw new InternalServerErrorException('Interal Server Error');
    }
  }

  async getAllPermission() {
    try {
      const permissionRole = [];
      const rolePermissions = await this.roleRepository.find({
        relations: [
          'rolePermission',
          'rolePermission.permission',
          'rolePermission.permission.method',
          'rolePermission.permission.module',
        ],
      });
      rolePermissions.forEach(role => {
        role.rolePermission.forEach(permission => {
          const rolePermission = `${_.toUpper(role.role)}_${_.toUpper(
            permission.permission.method.method,
          )}_${_.toUpper(permission.posession)}_${_.toUpper(
            permission.permission.module.module,
          )}`;
          permissionRole.push(rolePermission);
        });
      });

      return permissionRole;
    } catch (error) {
      throw new InternalServerErrorException('Inerternal Server Error');
    }
  }
}
