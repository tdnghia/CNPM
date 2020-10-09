import { Controller, Get, Post, Body, UsePipes, Put } from '@nestjs/common';
import { AuthServices } from './auth.service';
import {
  LoginDTO,
  RegisterDTO,
  ChangePwdDTO,
  EmployersDTO,
} from 'src/App/auth/auth.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { ApiTags } from '@nestjs/swagger';
import { UserSession } from 'src/common/decorators/user.decorator';
import { Methods } from 'src/common/decorators/method.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { Modules } from 'src/common/decorators/module.decorator';
import { ModuleEnum } from 'src/common/enums/module.enum';

@ApiTags('v1/auth')
@Controller('api/v1/auth')
@Modules(ModuleEnum.PROFILE)
export class AuthController {
  constructor(private authService: AuthServices) {}

  @Get()
  // @UseGuards(AuthGuard)
  getRoleByUser(id: string) {
    return this.authService.getRolesPermission(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async Login(@Body() data: LoginDTO) {
    const result = await this.authService.login(data);
    return result;
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  async Register(@Body() data: RegisterDTO) {
    return this.authService.register(data);
  }

  @Post('newlead')
  @UsePipes(new ValidationPipe())
  async addLead(@Body() data: EmployersDTO) {
    return this.authService.addLead(data);
  }

  @Put('me/password')
  @Methods(methodEnum.UPDATE)
  @UsePipes(new ValidationPipe())
  async changePwd(@Body() body: ChangePwdDTO, @UserSession() user) {
    return this.authService.changePwd(user, body);
  }

  @Get('me')
  @Methods(methodEnum.READ)
  async getProfile(@UserSession() user: any) {
    const { id } = user.users;
    return await this.authService.getProfile(id);
  }

  @Post('forgot-password')
  async forgotPassword() {}
}
