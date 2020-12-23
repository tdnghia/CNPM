import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  OneToMany,
  ManyToMany,
  JoinTable,
  Unique,
  BeforeUpdate,
} from 'typeorm';
import { Base } from '../entity/base.entity';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsBoolean,
  IsIn,
  ValidateNested,
  MinLength,
} from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Exclude, Type } from 'class-transformer';
import { CrudValidationGroups } from '@nestjsx/crud';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entity/role.entity';
import { Notification } from './notification.entity';
import { Address } from './address.entity';
import { Profile } from './profile.entity';
import { Category } from './category.entity';
import { EducationsEntity } from './education.entity';
import { Job } from './job.entity';
import { Article } from './article.entity';
import { AppliedJob } from './applied_job.entity';
const { CREATE, UPDATE } = CrudValidationGroups;

@Entity('users')
@Unique(['email'])
export class User extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'admin@gmail.com' })
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  // eslint-disable-next-line @typescript-eslint/camelcase
  @IsEmail({ require_tld: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    readonly: true,
  })
  email: string;

  @ApiProperty({ example: 'admin' })
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @MinLength(5, {
    always: true,
    message: 'Password requires at least 5 letters',
  })
  @MaxLength(255, { always: true, message: 'Max length is 255' })
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Exclude()
  @IsBoolean()
  @IsOptional({ groups: [UPDATE] })
  @Column({ type: 'boolean', default: false })
  ExpiredToken: boolean;

  @IsBoolean()
  @IsOptional({ groups: [CREATE] })
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ApiProperty({ example: 3 })
  @IsIn([2, 3, 4])
  @Column({ type: 'int', default: 3 })
  roleId: number;

  /**
   * The relation between User and Role
   */
  @ManyToOne(
    type => Role,
    role => role.users,
    { eager: true },
  )
  @JoinColumn({ name: 'roleId' })
  role: Role;

  /**
   * The relation between User and Notification
   */
  @ManyToMany(
    type => Notification,
    notification => notification.users,
  )
  @JoinTable({
    name: 'user_notify',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'notify_id', referencedColumnName: 'id' },
  })
  notifications: Notification[];

  /**
   * The relation between User and Profile
   */
  @IsOptional({ groups: [UPDATE, CREATE] })
  @ValidateNested({ always: true })
  @Type(type => Profile)
  @OneToOne(
    type => Profile,
    profile => profile.user,
    { cascade: true },
  )
  @JoinColumn()
  profile: Profile;

  /**
   * The relation between User and adress
   */
  @ManyToMany(
    type => Address,
    address => address.user,
  )
  @JoinTable({
    name: 'user_address',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'addressId',
      referencedColumnName: 'id',
    },
  })
  address: Address[];

  /**
   * The relation between User and category
   */
  @OneToMany(
    type => Category,
    category => category.user,
  )
  categories: Category[];

  /**
   * The relation between User and Article
   */
  @OneToMany(
    type => Article,
    article => article.user,
  )
  articles: Article[];

  /**
   * The relationship between User and JOb
   */
  @OneToMany(
    type => Job,
    job => job.user,
    { cascade: true },
  )
  jobs: Job[];

  /**
   * A user can have many favorites books
   */
  @ManyToMany(
    type => Job,
    job => job.favoriteBy,
  )
  favorites: Job[];

  /**
   * A user can apply many jobs
   */

  @OneToMany(
    type => AppliedJob,
    appliedJob => appliedJob.user,
  )
  applied: Job[];

  /**
   * Recently Job
   */
  @ManyToMany(
    type => Job,
    job => job.recentlyUser,
  )
  recentlyJob: Job[];

  /**
   * Exec Hash Function before Insert
   */
  @BeforeInsert()
  // @BeforeUpdate()
  async hashPassword() {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
}
