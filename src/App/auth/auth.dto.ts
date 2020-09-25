import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsDateString,
  MinLength,
} from 'class-validator';
import { Match } from 'src/Helper/validation/match.decorator';
import { CrudValidationGroups } from '@nestjsx/crud';
const { CREATE, UPDATE } = CrudValidationGroups;
export class LoginDTO {
  @ApiProperty({
    type: String,
    description: 'username or email',
    required: true,
    example: 'admin@gmail.com',
  })
  @IsNotEmpty({ groups: [CREATE] })
  email: string;
  @IsString()
  @IsNotEmpty({ groups: [CREATE] })
  @ApiProperty({
    type: String,
    description: 'password',
    required: true,
    example: 'admin',
  })
  password: string;
}
export class RegisterDTO {
  @ApiProperty({
    example: 'admin@gmail.com',
    type: String,
    description: 'Email',
    required: true,
  })
  @IsNotEmpty({ groups: [CREATE] })
  email: string;

  @ApiProperty({
    example: 'admin',
    description: 'Password required at least 5 letters',
  })
  @MinLength(5, {
    always: true,
    message: 'Password requires at least 5 letters',
  })
  @IsString({ always: true })
  @IsNotEmpty({ groups: [CREATE] })
  @ApiProperty({ type: String, description: 'password', required: true })
  password: string;

  @IsString()
  @Match('password')
  @ApiProperty({
    type: String,
    description: 'Confirm password',
    required: true,
  })
  confirmPassword: string;

  @IsString()
  @ApiProperty({ type: String, description: 'Name' })
  name: string;

  @ApiProperty({
    example: 'MALE',
    type: String,
    description: 'Gender',
    required: true,
  })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  gender: string;
}

export class ChangePwdDTO {
  @ApiProperty({
    example: '12345678',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  password: string;
}
