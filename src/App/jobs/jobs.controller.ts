import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Crud,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { BaseController } from 'src/common/Base/base.controller';
import { Methods } from 'src/common/decorators/method.decorator';
import { Modules } from 'src/common/decorators/module.decorator';
import { UserSession } from 'src/common/decorators/user.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { getSlug } from 'src/core/utils/helper';
import { Job } from 'src/entity/job.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { IsNull, Not } from 'typeorm';
import { JobRepository } from './jobs.repository';
import { JobService } from './jobs.service';

@Crud({
  model: {
    type: Job,
  },
  params: {
    slug: {
      field: 'id',
      type: 'string',
      primary: true,
    },
  },
  query: {
    filter: [],
    join: {
      user: {
        eager: true,
        exclude: ['password'],
      },
      'user.profile': {
        eager: true,
      },
    },
  },
})
@ApiTags('v1/jobs')
@Controller('/api/v1/jobs')
@Modules(ModuleEnum.JOB)
export class JobsController extends BaseController<Job> {
  constructor(
    public service: JobService,
    private readonly repository: JobRepository,
  ) {
    super(repository);
  }

  @Override('createOneBase')
  @Methods(methodEnum.CREATE)
  async createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Job) {
    try {
      const data = await this.base.createOneBase(req, dto);
      return data;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Internal Server error',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Override('getManyBase')
  async getMany(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Job) {
    try {
      return await this.base.getManyBase(req);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getFavoritesByUser(@UserSession() user: any) {
    const userId = user.users.id;
    return this.service.getFavoritesByUser(userId);
  }

  @Get('applied')
  @Methods(methodEnum.READ)
  async getAppliedJobByCompany(@UserSession() user: any) {
    const userId = user.users.id;
    return this.service.getJobAppliedByCompany(userId);
  }
  @Override('getOneBase')
  async getOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Job) {
    try {
      const data = await this.base.getOneBase(req);
      return data;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Job not found',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('updateOne/:id')
  async updateUser(@Body() dto: Partial<Job>, @Param('id') id: string) {
    try {
      const result = await this.repository.findOne({ id: id });
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

  @Delete('/delete/:id')
  async forceDelete(
    @ParsedRequest() req: CrudRequest,
    @Param('id') id: string,
  ): Promise<void> {
    console.log(id);
    const data = this.repository.findOne({
      where: { id, deletedat: IsNull() },
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
    try {
      await this.repository.delete({ id, deletedat: IsNull() });
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
      where: { id, deletedat: Not(IsNull()) },
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

  @Post('/:id/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async favoritesJob(@Param('id') id: string, @UserSession() user) {
    const userId = user.users.id;
    return this.service.addFavoritesJob(id, userId);
  }

  @Post('/:id/applies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async appliesJOb(@Param('id') id: string, @UserSession() user) {
    const userId = user.users.id;
    return this.service.appliesJob(id, userId);
  }
}
