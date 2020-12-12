import { ApiProperty } from "@nestjs/swagger";
import { CrudValidationGroups } from "@nestjsx/crud";
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Base } from "./base.entity";
import { Profile } from "./profile.entity";

const { CREATE, UPDATE } = CrudValidationGroups;
@Entity('experiences')
export class Experience extends Base {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'MGM Technology' })
    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsString({ always: true })
    @Column({ type: 'text' })
    company: string;

    @ApiProperty({ example: 'backend' })
    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsString({ always: true })
    @Column({ type: 'text' })
    position: string;

    @ApiProperty({ example: 'Thiết kế hệ thống API bằng nestjs ...' })
    @IsOptional({ groups: [CREATE, UPDATE] })
    @IsString({ always: true })
    @Column({ type: 'text' })
    description: string;

    @ApiProperty({ example: '2019-01-01' })
    @IsOptional({ groups: [CREATE, UPDATE] })
    @IsDate({ always: true })
    @Column({ type: 'date' })
    start: Date;

    @ApiProperty({ example: '2020-01-01' })
    @IsOptional({ groups: [CREATE, UPDATE] })
    @IsDate({ always: true })
    @Column({ type: 'date' })
    end: Date;

    @IsString({ always: true })
    @Column({ type: 'uuid' })
    profileId: string;
    /** Relation to Profile */

    @ManyToOne(
        type => Profile,
        profile => profile.experiences,
    )
    profile: Profile;
}