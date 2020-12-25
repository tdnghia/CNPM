import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
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
  IsNotEmpty,
  IsDecimal,
  IsIn,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../common/enums/jobTypes.enum';
import { enumToArray } from '../core/utils/helper';
import { Category } from './category.entity';
import { Address } from './address.entity';
import { Exclude } from 'class-transformer';
import { AppliedJob } from './applied_job.entity';

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
  @Column({ type: 'text', nullable: true })
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

  @ApiProperty({ example: 1 })
  @IsOptional({ groups: [UPDATE, CREATE] })
  @Column({ type: 'int', nullable: true })
  experience: number;

  @ApiProperty({ example: 'YYYY-MM-DD' })
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @Column({ type: 'date' })
  deadline: Date;

  @ApiProperty({
    example:
      'https://eatsleepworkrepeat.com/wp-content/uploads/2020/06/office.jpg',
  })
  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsString({ always: true })
  @Column({ type: 'text', nullable: true })
  introImg: string;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @Exclude()
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  status: boolean;

  @ApiProperty({ example: [3, 2, 19] })
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  cateIds: Array<number | string>;
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
  @ManyToMany(
    type => Category,
    category => category.jobs,
  )
  @JoinTable({
    name: 'Job_Cate',
    joinColumn: {
      name: 'jobId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'cateId',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  /**
   * The relationship between Job and address
   */

  @ApiProperty({ example: 48 })
  @IsInt({ always: true })
  city: number;

  @ApiProperty({ example: '54 Nguyen Thi Minh Khai' })
  @IsString()
  street: string;

  @ApiProperty({ example: 15.99119 })
  longitude: number;

  @ApiProperty({ example: 108.137062 })
  latitude: number;

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

  @OneToMany(
    type => AppliedJob,
    appliedJob => appliedJob.job,
  )
  appliedBy: User[];

  /**
   * Recently Job
   */
  @ManyToMany(
    type => User,
    user => user.recentlyJob,
  )
  @JoinTable({
    name: 'job_recently',
    joinColumn: {
      name: 'jobId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  recentlyUser: User[];
}
