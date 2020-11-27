import { ApiProperty } from '@nestjs/swagger';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsNotEmpty } from 'class-validator';

const { CREATE } = CrudValidationGroups;
export class SkillDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ always: true })
  skillId: number;

  @ApiProperty({ example: 4 })
  @IsNotEmpty({ groups: [CREATE] })
  experience: number;
}
