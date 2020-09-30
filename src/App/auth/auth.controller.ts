import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AuthServices } from './auth.service';
import {
  LoginDTO,
  RegisterDTO,
  ChangePwdDTO,
  EmployersDTO,
} from 'src/App/auth/auth.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
@ApiTags('v1/auth')
@Controller('api/v1/auth')
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
  @UseGuards(JwtAuthGuard)
  async changePwd(@Body() body: ChangePwdDTO, @User() user) {
    return this.authService.changePwd(user, body);
  }
  @Get('me')
  async getProfile() {}

  @Post('forgot-password')
  async forgotPassword() {}
}
