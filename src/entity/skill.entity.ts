import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Base } from './base.entity';
import { ProfileSkill } from './ProfileSkill.entity';

@Entity('skills')
export class Skill extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'namesss of skill', example: 'BACKEND' })
  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ type: 'text' })
  icon: string;

  /** Relation with ProfileSkill */

  @OneToMany(
    type => ProfileSkill,
    profileSkill => profileSkill.skill,
    {
      cascade: true,
      eager: true,
    },
  )
  profileSkill: ProfileSkill[];
}
