import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsInt } from 'class-validator';
import { Role } from './role.entity';
import { PermissionsEntity } from './permission.entity';
import { posessionEnum } from '../common/enums/possession.enum';
@Entity('role_permission')
export class RolePermission {
  @IsInt()
  @Column({ type: 'int' })
  roleId: number;

  @PrimaryGeneratedColumn()
  index_name: number;
  @IsInt()
  @Column({ type: 'int' })
  permissionId: number;

  @ManyToOne(
    type => Role,
    role => role.rolePermission,
  )
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(
    type => PermissionsEntity,
    permission => permission.rolePermission,
  )
  @JoinColumn({ name: 'permissionId' })
  permission: PermissionsEntity;

  @Column({ type: 'enum', enum: posessionEnum, default: 'any' })
  posession: string;
}
