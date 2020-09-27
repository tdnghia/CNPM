import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiTags } from '@nestjs/swagger';
import { CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { RolePermissionRepository } from './rolePermission.repository';
import { RolesRepository } from '../roles/roles.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entity/role.entity';
import { Repository } from 'typeorm';

// @Crud({
//   model: {
//     type: PermissionsEntity,
//   },
// })
@ApiTags('api/v1/permission')
@Controller('/api/v1/permission')
export class PermissionController {
  constructor(
    private permissionService: PermissionService,
    private repository: RolePermissionRepository,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  @Get(':role')
  async GetAllPermissionByRole(
    @ParsedRequest() req: CrudRequest,
    @Param('role') role: string,
  ) {
    try {
      const roleId = await this.roleRepository.findOne({ where: { role } });
      console.log('role', roleId);
      const permission = await this.repository.find({
        where: { roleId },
        relations: ['permission'],
      });
      console.log('permission', permission);
    } catch (error) {}
  }

  @Post()
  async updatePermission() {
    console.log('here');
  }
}
