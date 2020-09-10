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
} from 'typeorm';
import { Base } from '../entity/base.entity';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsBoolean,
  IsPhoneNumber,
  IsIn,
  ValidateNested,
  MinLength,
} from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Type } from 'class-transformer';
import { CrudValidationGroups } from '@nestjsx/crud';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entity/role.entity';
import { Notification } from './notification.entity';
import { Address } from './address.entity';
import { Profile } from './profile.entity';
import { Tag } from './tag.entity';
import { Category } from './category.entity';
import { EducationsEntity } from './education.entity';
const { CREATE, UPDATE } = CrudValidationGroups;

@Entity('users')
export class User extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    unique: true,
    readonly: true,
  })
  email: string;

  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsString({ always: true })
  @MaxLength(255, { always: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  introduction: string;

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

  @IsOptional({ groups: [UPDATE, CREATE] })
  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @IsOptional({ groups: [UPDATE, CREATE] })
  @IsPhoneNumber('VN US')
  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string;

  @ApiProperty({ example: '3 | 4' })
  @IsIn([2, 3, 4])
  @Column({ type: 'int', default: 4 })
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
  @OneToOne(
    type => Address,
    address => address.user,
  )
  address: Address;

  /**
   * The relation between User and tag
   */
  @OneToMany(
    type => Tag,
    Tag => Tag.author,
  )
  tags: Tag[];

  /**
   * The relation between User and category
   */
  @OneToMany(
    type => Category,
    category => category.user,
  )
  categories: Category[];

  /**
   * The relation between User and education
   */
  @OneToMany(
    type => EducationsEntity,
    education => education.user,
    { cascade: true },
  )
  educations: EducationsEntity[];
  /**
   * Exec Hash Function before Insert
   */
  @BeforeInsert()
  async hashPassword() {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
}
