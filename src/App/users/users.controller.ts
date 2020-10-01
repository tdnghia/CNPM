import {
  Controller,
  Response,
  HttpStatus,
  HttpException,
  Param,
  HttpCode,
  InternalServerErrorException,
  Get,
  UseGuards,
  Put,
  Body,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CrudRequest,
  CreateManyDto,
  Crud,
  Override,
  ParsedRequest,
  ParsedBody,
} from '@nestjsx/crud';
import generatePassword = require('password-generator');
import { User } from '../../entity/user.entity';
import { UserService } from './users.service';
import { UserRepository } from './user.repository';
import { BaseController } from 'src/common/Base/base.controller';
import { Not, IsNull } from 'typeorm';
import { Modules } from 'src/common/decorators/module.decorator';
import { Methods } from 'src/common/decorators/method.decorator';

import {
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { methodEnum } from 'src/common/enums/method.enum';
import { ModuleEnum } from 'src/common/enums/module.enum';
import nodemailer from 'nodemailer';

@Crud({
  model: {
    type: User,
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
    name: {
      field: 'name',
      type: 'string',
      primary: true,
    },
  },
  query: {
    filter: [],
    exclude: ['password'],
    join: {
      role: {
        eager: true,
        allow: ['role'],
      },
      'role.permissions': {
        alias: 'pr',
      },
      profile: {
        exclude: ['updatedAt'],
        eager: true,
      },
    },
  },
})
@ApiTags('v1/users')
@Controller('/api/v1/users')
@Modules(ModuleEnum.USER)
export class UserController extends BaseController<User> {
  constructor(
    public service: UserService,
    private readonly repository: UserRepository,
  ) {
    super(repository);
  }
  private maxLength = 12;
  private minLength = 8;
  // get base(): CrudController<User> {
  //   return this;
  // }
  @Override('getManyBase')
  @Methods(methodEnum.READ)
  async getAll(@ParsedRequest() req: CrudRequest) {
    // req.parsed.search.$and = [{ isActive: { $eq: true } }];
    return await this.base.getManyBase(req);
  }

  @Override('deleteOneBase')
  async softDelete(@ParsedRequest() req: CrudRequest): Promise<void> {
    const id = req.parsed.paramsFilter.find(
      f => f.field === 'id' && f.operator === '$eq',
    ).value;

    const data = this.repository.findOne({ where: { id } });
    if (!data) {
      throw new HttpException(
        {
          message: 'Not Found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      await this.repository.softDelete({ id });
    } catch (error) {
      throw new InternalServerErrorException('Incomplete CrudRequest');
    }
  }

  @Override('updateOneBase')
  async restore(@ParsedRequest() req: CrudRequest): Promise<void> {
    const id = req.parsed.paramsFilter.find(
      f => f.field === 'id' && f.operator === '$eq',
    ).value;

    const data = await this.repository.findOne({
      withDeleted: true,
      where: { id, deletedAt: Not(IsNull()) },
    });
    if (!data) {
      throw new HttpException(
        {
          message: 'Not Found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.repository.restore({ id });
  }
  @Override('createOneBase')
  @ApiOkResponse({ description: 'User login' })
  @ApiUnauthorizedResponse({ description: 'Invalid credential' })
  async createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: User) {
    try {
      const data = await this.base.createOneBase(req, dto);
      return data;
    } catch (error) {
      console.log('err', error);

      if (error.code === '23505') {
        throw new HttpException(
          {
            message: 'User or Email already exists',
            status: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      } else {
        throw new HttpException(
          {
            message: 'Internal Server error',
            status: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  @Get('inActive/:id')
  async Inactive(@ParsedRequest() req: CrudRequest): Promise<void> {
    try {
      const deletedUser = await this.repository.find({
        withDeleted: true,
        where: { deletedAt: Not(IsNull()) },
      });
      console.log(deletedUser);

      // const data = this.repository.findOne({ where: { id } });
      // console.log(data);
    } catch (error) {
      //console.log(error);
      console.log('error', error);
    }
  }

  /** Get All user Inactive status */
  @Get('inactive')
  async getInactive(@ParsedRequest() req: CrudRequest) {
    try {
      const data = this.repository.find({
        withDeleted: true,
        where: {
          deletedAt: Not(IsNull()),
        },
        relations: ['role'],
        select: ['id', 'email', 'createdAt', 'role'],
      });
      return data;
    } catch (error) {
      throw new InternalServerErrorException('Error: Internal Server');
    }
  }

  private isStrongEnough(password: string) {
    const UPPER_RE = /([A-Z])/g;
    const LOWER_RE = /([a-z])/g;
    const NUMBER_RE = /([\d])/;
    const uc = password.match(UPPER_RE);
    const lc = password.match(LOWER_RE);
    const nc = password.match(NUMBER_RE);
    const uppercaseMinCount = 3;
    const lowercaseMinCount = 3;
    const numberMinCount = 2;

    return (
      password.length >= this.minLength &&
      password.length <= this.maxLength &&
      uc &&
      lc &&
      nc &&
      uc.length >= uppercaseMinCount &&
      lc.length >= lowercaseMinCount &&
      nc.length >= numberMinCount
    );
  }
  // Generate random password Function
  private customerPassword() {
    let password = '';
    const randomLength = Math.floor(
      Math.random() * (this.maxLength - this.minLength) + this.minLength,
    );
    while (!this.isStrongEnough(password)) {
      password = generatePassword(randomLength, false, /[\d\w]/);
    }
    return password;
  }
  @Get('unauthorized')
  async getUnAuthorized(@ParsedRequest() req: CrudRequest) {
    try {
      const data = this.repository.find({
        where: {
          active: false,
        },
        relations: ['role'],
        select: ['id', 'email', 'createdAt', 'role'],
      });
      return data;
    } catch (error) {
      throw new InternalServerErrorException('Error: Internal Server');
    }
  }

  @Put('identify/:id')
  async authorizedUser(
    @ParsedRequest() req: CrudRequest,
    @Param('id') userId: string,
  ) {
    const user = await this.repository.findOne({
      where: { id: userId, roleId: 4 },
    });
    if (user) {
      const nodemailer = require('nodemailer');
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'tdnghia1011@gmail.com', // generated ethereal user
          pass: 'shidoo1011', // generated ethereal password
        },
      });

      // send mail with defined transport object
      const mailOptions = {
        from: '"Fred Foo 👻" <tdnghia1011@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b> Nghĩa nè Quốc </b>', // html body
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } else {
      throw new UnauthorizedException('Invalid Credential');
    }
  }
  @Override('createManyBase')
  async createMany(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateManyDto<User>,
  ) {
    try {
      return await this.base.createManyBase(req, dto);
    } catch (error) {
      console.log(error);
      if (error.code === '23505') {
        throw new HttpException(
          {
            message: 'User or Email already exists',
            status: HttpStatus.CONFLICT,
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          {
            message: 'Internal Server error',
            status: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
  @Override('getOneBase')
  async getOne(@ParsedRequest() req: CrudRequest, @ParsedRequest() dto: User) {
    try {
      const data = await this.base.getOneBase(req);
      return data;
    } catch (error) {
      throw new HttpException(
        {
          message: 'User not found',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
  @Put('updateOne/:id')
  async updateUser(@Body() dto: Partial<User>, @Param('id') id: string) {
    try {
      const result = await this.repository.findOne({ id });
      if (!result) {
        throw new HttpException(
          {
            message: 'Not Found',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.repository.update({ id }, dto);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Internal Server Error',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
