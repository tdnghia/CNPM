import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiTags } from '@nestjs/swagger';
import { CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { RolePermissionRepository } from './rolePermission.repository';
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

  // @Get('/all')
  // async getAllPermission(@ParsedRequest() req: CrudRequest) {
  //   console.log('here');

  //   return await this.permissionService.getAllPermission();
  // }

  @Get(':role')
  async GetAllPermissionByRole(
    @ParsedRequest() req: CrudRequest,
    @Param('role') role: string,
  ) {
    try {
      const rolePermissions: any = await this.permissionService.getRolesPermission(
        role,
      );
      return rolePermissions;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
