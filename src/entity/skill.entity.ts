import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Base } from "./base.entity";
import { ProfileSkill } from "./ProfileSkill.entity";

@Entity('skills')
export class Skill extends Base {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({description: 'name of skill', example: 'BACKEND'})
    @Column({nullable: false, type: 'text'})
    name: string;

    /** Relation with ProfileSkill */

    @OneToMany(
        type => ProfileSkill,
        profile_skill => profile_skill.skill,
        {
            cascade: true
        }
    )

    profile_skill: ProfileSkill[]
}