import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermission } from 'src/entity/role_permission.entity';
import { PermissionController } from './permission.controller';
import { PermissionsEntity } from 'src/entity/permission.entity';
import { PermissionService } from './permission.service';
import { Role } from 'src/entity/role.entity';
import { User } from 'src/entity/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([RolePermission, Role, PermissionsEntity, User]),
  ],
  providers: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}
