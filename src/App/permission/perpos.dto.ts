import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class PerPosDTO {
  @ApiProperty({ example: 1 })
  @IsInt({ always: true })
  permissionId: number;

  @ApiProperty({ example: 'OWN' })
  @IsString({ always: true })
  posession: string;
}
