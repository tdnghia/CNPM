import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Put,
  UsePipes,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiTags } from '@nestjs/swagger';
import { CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { RolePermissionRepository } from './rolePermission.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entity/role.entity';
import { Repository } from 'typeorm';
import { Modules } from 'src/common/decorators/module.decorator';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { Methods } from 'src/common/decorators/method.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { PermissionDTO } from './permission.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { RolePermission } from 'src/entity/role_permission.entity';

// @Crud({
//   model: {
//     type: PermissionsEntity,
//   },
// })
@Modules(ModuleEnum.PERMISSION)
@ApiTags('api/v1/permissions')
@Controller('/api/v1/permission')
export class PermissionController {
  constructor(
    private permissionService: PermissionService,
    private repository: RolePermissionRepository,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  @Methods(methodEnum.READ)
  @Get('/all')
  async getAllPermission(@ParsedRequest() req: CrudRequest) {
    return await this.permissionService.getAllPermission();
  }

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

  // @Override('createManyBase')
  @Put(':id')
  @UsePipes(new ValidationPipe())
  async updatePermission(@Param('id') id: number, @Body() data: PermissionDTO) {
    const role = await this.roleRepository.findOne({
      where: { id: data.roleId },
    });

    const permission = await this.permissionService.getOne(id);
    if (!role) {
      throw new NotFoundException('Role Not Found');
    }
    if (!permission) {
      throw new NotFoundException('Permission Not Found');
    }

    let rolePermission: RolePermission = await this.repository.findOne({
      where: { roleId: role.id, permissionId: permission.id },
    });

    if (!rolePermission) {
      rolePermission = new RolePermission();
    }

    return await this.permissionService.saveRolePermission(
      rolePermission,
      data,
    );
  }
}
