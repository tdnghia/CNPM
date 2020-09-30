import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Base } from './base.entity';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsIn,
  IsPhoneNumber,
} from 'class-validator';
import { CrudValidationGroups } from '@nestjsx/crud';
import { User } from './user.entity';
import { Experience } from '../common/enums/experience.enum';
import { enumToArray } from '../core/utils/helper';
import { ApiProperty } from '@nestjs/swagger';
const { CREATE, UPDATE } = CrudValidationGroups;

@Entity('profiles')
export class Profile extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @Column({ type: 'text', nullable: true, default: null })
  profileUrl: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @Column({ type: 'text', nullable: true, default: null })
  pageURL: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @Column({ type: 'text', nullable: true, default: null })
  cvURL: string;

  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  introduction: string;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsPhoneNumber('VN US')
  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string;

  @ApiProperty({ example: '1' })
  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsIn(enumToArray(Experience))
  @Column({ type: 'enum', enum: Experience, nullable: true })
  experience: string;

  @ApiProperty({ description: 'Employee Number', example: '300' })
  @IsOptional({ groups: [CREATE, UPDATE] })
  @Column({ type: 'int', nullable: true })
  quantity: number;

  /** Relation to User */

  @OneToOne(
    type => User,
    user => user.profile,
  )
  user: User;
}
