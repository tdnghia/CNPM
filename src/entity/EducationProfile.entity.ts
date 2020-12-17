import { CrudValidationGroups } from "@nestjsx/crud";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Entity, Unique, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "./base.entity";
import { EducationsEntity } from "./education.entity";
import { Profile } from "./profile.entity";

const { CREATE, UPDATE } = CrudValidationGroups;
@Entity('Education_Profile')
@Unique('uniquekey_education_profile', ['educationId', 'profileId'])
export class EducationProfile extends Base {
    @PrimaryGeneratedColumn()
    index_name: number;

    @IsString({ always: true })
    @Column({ type: 'uuid' })
    educationId: string;

    @IsString({ always: true })
    @Column({ type: 'uuid' })
    profileId: string;

    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsBoolean({ always: true })
    @Column({ type: 'boolean', default: true })
    current: boolean;

    /** Relation with Profile */

    @ManyToOne(
        type => Profile,
        profile => profile.profileSkill,
    )
    @JoinColumn({ name: 'profileId' })
    profile: Profile;

    /** Raltion with Education */

    @ManyToOne(
        type => EducationsEntity,
        education => education.educationProfile,
    )
    @JoinColumn({ name: 'educationId' })
    education: EducationsEntity;
}