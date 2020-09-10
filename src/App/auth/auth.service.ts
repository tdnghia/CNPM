import {
  Injectable,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/entity/role.entity';
import { UserRepository } from 'src/App/users/user.repository';
import * as bcrypt from 'bcrypt';
import { LoginDTO, RegisterDTO, ChangePwdDTO } from './auth.dto';
import { sign } from 'jsonwebtoken';
import { Payload } from 'src/types/payload';
@Injectable()
export class AuthServices {
  constructor(
    private userRepository: UserRepository,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getRolesPermission(role: string) {
    try {
      const rolePermission = await this.roleRepository.findOne({
        where: { role },
        relations: [
          'rolePermission',
          'rolePermission.permission',
          'rolePermission.permission.method',
          'rolePermission.permission.module',
        ],
      });
      return rolePermission;
    } catch (error) {
      throw new InternalServerErrorException('Interal Server Error');
    }
  }

  async login(data: LoginDTO) {
    try {
      const user: User = await this.validateUser(data);
      const payload: Payload = {
        id: user.id,
        name: user.name,
        role: user.role.role,
      };

      return {
        token: await this.signPayload(payload),
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.role,
      };
    } catch (error) {
      throw error;
    }
  }
  async signPayload(payload: Payload) {
    return await sign(payload, process.env.SECRET_KEY, { expiresIn: '12h' });
  }

  async register(dto: RegisterDTO) {
    try {
      const data = this.userRepository.create({
        ...dto,
      });
      return await this.userRepository.save(data);
    } catch (error) {
      if (error.code == '23505') {
        throw new HttpException(
          {
            message: 'Email Already exists',
            code: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async validateUser(payload: LoginDTO): Promise<User> {
    let userByEmail = null;

    try {
      userByEmail = await this.userRepository.findOne({
        where: { email: payload.email },
      });
    } catch (error) {
      throw new HttpException(
        {
          message: 'Internal Server Error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (
      !userByEmail ||
      !(await this.comparePassword(payload.password, userByEmail.password))
    ) {
      throw new HttpException(
        {
          message: 'Invalid Credentials',
          status: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return userByEmail;
  }
  async comparePassword(attempt: string, password: string): Promise<boolean> {
    return await bcrypt.compare(attempt, password);
  }

  async changePwd(user: any, body: ChangePwdDTO) {
    const checkUser = await this.userRepository.findOne({
      where: { id: user.users.id },
    });
    if (!checkUser) {
      return new NotFoundException('User not found');
    } else if (!bcrypt.compareSync(body.oldPassword, checkUser.password)) {
      return new BadRequestException('Password incorrect');
    }
    await this.userRepository.update(
      { id: user.users.id },
      { password: await bcrypt.hash(body.password, 12) },
    );
    return { status: true };
  }
}
