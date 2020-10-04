import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermissionRepository } from './rolePermission.repository';
import { Role } from 'src/entity/role.entity';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { PermissionsEntity } from 'src/entity/permission.entity';
import { RolePermission } from 'src/entity/role_permission.entity';
import { PermissionDTO } from './permission.dto';
import { UserRepository } from '../users/user.repository';

@Injectable()
export class PermissionService {
  constructor(
    private repository: RolePermissionRepository,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(PermissionsEntity)
    private readonly permissionRepository: Repository<PermissionsEntity>,
    private readonly userRepository: UserRepository,
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
        permissionRole.push({
          scope: rolePermission,
          id: permission.permissionId,
          posession: permission.posession,
          action: `${permission.permission.method.method} ${permission.permission.module.module}`,
        });
      });
      return permissionRole;
    } catch (error) {
      throw new InternalServerErrorException('Interal Server Error');
    }
  }

  async getAllPermission() {
    try {
      const permissionRole = [];

      const permissions = await this.permissionRepository.find({
        relations: ['method', 'module'],
      });

      permissions.forEach(permission => {
        const scope = `${_.toUpper(permission.method.method)} ${_.toUpper(
          permission.module.module,
        )}`;
        permissionRole.push({
          id: permission.id,
          scope,
        });
      });

      return permissionRole;
    } catch (error) {
      console.log('err', error);

      throw new InternalServerErrorException('Inerternal Server Error');
    }
  }

  async getOne(id: number) {
    try {
      return await this.permissionRepository.findOne({ id });
    } catch (error) {
      throw new InternalServerErrorException('Interal Server Error Exception');
    }
  }

  async saveRolePermission(
    rolePermission: RolePermission,
    data: PermissionDTO,
    id: number,
  ) {
    try {
      const Object = rolePermission;
      Object.roleId = data.roleId;
      Object.posession = data.possession;
      Object.permissionId = id;

      const getUserByRole = await this.userRepository.find({
        where: { roleId: data.roleId },
      });

      //Set User by defined role has expiredToken
      Promise.all(
        getUserByRole.map(async user => {
          user.ExpiredToken = true;
          return await this.userRepository.save(user);
        }),
      );
      return await this.repository.save(Object);
    } catch (error) {
      throw new InternalServerErrorException('Interal Server Error Exception');
    }
  }
}
