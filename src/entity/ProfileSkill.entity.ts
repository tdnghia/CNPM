import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Base } from './base.entity';
import { Profile } from './profile.entity';
import { Skill } from './skill.entity';

@Entity('Profile_Skill')
@Unique('uniquekey_profile_skill', ['profileId', 'skillId'])
export class ProfileSkill extends Base {
  @PrimaryGeneratedColumn()
  index_name: number;

  @IsString({ always: true })
  @Column({ type: 'uuid' })
  profileId: string;

  @IsString({ always: true })
  @Column({ type: 'uuid' })
  skillId: string;

  @ApiProperty({ description: 'Skill time in month', example: 5 })
  @Column({ type: 'int', nullable: false })
  experience: number;

  /** Relation with Profile */

  @ManyToOne(
    type => Profile,
    profile => profile.profileSkill,
  )
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  /** Raltion with Skill */

  @ManyToOne(
    type => Skill,
    skill => skill.profileSkill,
  )
  @JoinColumn({ name: 'skillId' })
  skill: Skill;
}
