import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CrudValidationGroups } from '@nestjsx/crud';
import { Base } from './base.entity';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsNotEmpty,
  IsDecimal,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../common/enums/jobTypes.enum';
import { Experience } from '../common/enums/experience.enum';
import { enumToArray } from '../core/utils/helper';
import { Category } from './category.entity';
import { Address } from './address.entity';

const { CREATE, UPDATE } = CrudValidationGroups;
@Entity('jobs')
export class Job extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Lap trinh Android, IOS' })
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ type: 'text' })
  name: string;

  @ApiProperty({ example: 'string' })
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ example: 1000 })
  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsDecimal()
  @Column({ type: 'decimal', nullable: true })
  lowestWage: number;

  @ApiProperty({ example: 1500 })
  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsDecimal()
  @Column({ type: 'decimal', nullable: true })
  highestWage: number;

  @ApiProperty({ example: 'string' })
  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsString({ always: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 'FULLTIME | PARTTIME' })
  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsIn(enumToArray(JobType))
  @Column({ type: 'enum', enum: JobType, nullable: true })
  type: string;

  @ApiProperty({ example: '1' })
  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsIn(enumToArray(Experience))
  @Column({ type: 'enum', enum: Experience, nullable: true })
  experience: string;

  @ApiProperty({ example: 'YYYY-MM-DD' })
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsDateString()
  @Column({ type: 'date' })
  deadline: Date;

  /**
   * Relation between User and Job
   */

  @ManyToOne(
    type => User,
    user => user,
  )
  user: User;

  /**
   * The relationship between Job and Category
   */
  @ManyToOne(
    type => Category,
    category => category.jobs,
  )
  categories: Category[];

  /**
   * The relationship between Job and address
   */

  @ManyToOne(
    type => Address,
    address => address.jobs,
  )
  address: Address;

  /**
   * Favorites Job
   */

  @ManyToMany(
    type => User,
    user => user.favorites,
  )
  @JoinTable({
    name: 'job_favorite',
    joinColumn: {
      name: 'jobId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  favoriteBy: User[];

  /**
   * Apply Job
   */
  @ManyToMany(
    type => User,
    user => user.applied,
  )
  @JoinTable({
    name: 'job_applied',
    joinColumn: {
      name: 'jobId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  appliedBy: User[];
}
