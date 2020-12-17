import { CrudValidationGroups } from "@nestjsx/crud";
import { IsOptional, IsString, IsDateString, IsBoolean, IsNotEmpty } from "class-validator";
import { Column } from "typeorm";

const { CREATE, UPDATE } = CrudValidationGroups;
export class EducationDTO {
    @IsString({ always: true })
    @Column({ type: 'uuid' })
    educationId: string;

    @IsOptional({ groups: [UPDATE] })
    @IsNotEmpty({ groups: [CREATE] })
    @IsBoolean({ always: true })
    @Column({ type: 'boolean', default: true })
    current: boolean;
}