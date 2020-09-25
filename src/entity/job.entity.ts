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
import { Job } from '../common/enums/jobTypes.enum';
import { Experience } from '../common/enums/experience.enum';
import { enumToArray } from '../core/utils/helper';
import { Tag } from './tag.entity';
import { Category } from './category.entity';
import { Address } from './address.entity';

const { CREATE, UPDATE } = CrudValidationGroups;
@Entity('jobs')
export class Jobs extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ type: 'text' })
  name: string;

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

  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsString({ always: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsIn(enumToArray(Job))
  @Column({ type: 'enum', enum: Job, nullable: true })
  type: string;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsIn(enumToArray(Experience))
  @Column({ type: 'enum', enum: Experience, nullable: true })
  experience: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ type: 'text' })
  slug: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsDateString()
  @Column({ type: 'date' })
  deadline: Date;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsBoolean({ always: true })
  @Column({ type: 'boolean', default: false })
  experimentDate: boolean;

  /**
   * Relation between User and Job
   */

  @ManyToOne(
    type => User,
    user => user,
  )
  user: User;

  /**
   * The relationship between User and Tag
   *
   */
  @ManyToMany(
    type => Tag,
    tag => tag.jobs,
  )
  @JoinTable({
    joinColumn: {
      name: 'jobId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];

  /**
   * The relationship between Job and Category
   */
  @ManyToOne(
    type => Category,
    category => category.jobs,
  )
  category: Category;

  /**
   * The relatinship between Job and address
   */

  @ManyToOne(
    type => Address,
    address => address.jobs,
  )
  address: Address;
}
