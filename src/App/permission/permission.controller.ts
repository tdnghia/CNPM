import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiTags } from '@nestjs/swagger';
import { CrudRequest, Override, ParsedBody, ParsedRequest } from '@nestjsx/crud';
import { RolePermissionRepository } from './rolePermission.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entity/role.entity';
import { RelationQueryBuilder, Repository } from 'typeorm';
import { Modules } from 'src/common/decorators/module.decorator';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { Methods } from 'src/common/decorators/method.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { PermissionDTO } from './permission.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { RolePermission } from 'src/entity/role_permission.entity';
import { get } from 'lodash';

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
  @Methods(methodEnum.READ)
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

  @Put(':id')
  @Methods(methodEnum.UPDATE)
  @UsePipes(new ValidationPipe())
  async updatePermission(@Param('id') id: number, @Body() data: PermissionDTO) {
    if (data.roleId == 1) {
      throw new BadRequestException('Permission roleAdmin can not be Modified');
    }
    const role = await this.roleRepository.findOne({
      where: { id: data.roleId },
    });
    console.log('id', id);

    const permission = await this.permissionService.getOne(id);

    if (!role) {
      throw new NotFoundException('Role Not Found');
    }

    if (!permission) {
      throw new NotFoundException('Permission Not Found');
    }
    let rolePermission = await this.repository.findOne({
      where: { roleId: role.id, permissionId: permission.id },
    });

    if (!rolePermission) {
      rolePermission = new RolePermission();
    }
    return await this.permissionService.saveRolePermission(
      rolePermission,
      data,
      id,
    );
  }

  @Delete(':id')
  @Methods(methodEnum.DELETE)
  async deleteOne(@Param('id') id: number, @Body() data: PermissionDTO) {
    if (data.roleId === 1) {
      throw new BadRequestException('Permission roleAdmin can not be Modified');
    }

    const rolePermission = await this.repository.findOne({
      where: { permissionId: id, roleId: data.roleId },
    });
    if (!rolePermission) {
      throw new NotFoundException('Role Permission Not Found');
    }
    return await this.repository.delete(rolePermission);
  }

  @Get('role/all')
  @Methods(methodEnum.READ)
  async getAllrole() {
    return await this.roleRepository.find();
  }
 
  @Put(':permissionId/updatePosession')
  @Methods(methodEnum.UPDATE)
  async updatePosession(
    @Param('permissionId') permissionId: number,
    @Body() dto: PermissionDTO
    ) {
      return this.repository.update({ roleId: dto.roleId, permissionId: permissionId}, dto);
    }
}
