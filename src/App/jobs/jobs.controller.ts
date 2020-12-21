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
  UsePipes,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Crud,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { RequestQueryBuilder } from '@nestjsx/crud-request';
import { BaseController } from 'src/common/Base/base.controller';
import { Methods } from 'src/common/decorators/method.decorator';
import { Modules } from 'src/common/decorators/module.decorator';
import { UserSession } from 'src/common/decorators/user.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { Job } from 'src/entity/job.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { IsNull, Not } from 'typeorm';
import { JobRepository } from './jobs.repository';
import { JobService } from './jobs.service';
import * as _ from 'lodash';

@Crud({
  model: {
    type: Job,
  },
  params: {
    id: {
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
        exclude: [
          'password',
          'active',
          'roleId',
          'createdat',
          'updatedat',
          'deletedat',
        ],
      },
      'user.profile': {
        eager: true,
        exclude: [
          'cvURL',
          'quantity',
          'experience',
          'createdat',
          'updatedat',
          'deletedat',
        ],
      },
      categories: {
        eager: true,
        exclude: ['createdat', 'updatedat', 'deletedat', 'parentId'],
      },
      address: {
        eager: true,
        exclude: ['createdat', 'updatedat', 'deletedat'],
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
  @UsePipes(new ValidationPipe())
  async createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Job) {
    return this.service.createJob(dto);
  }

  @Override('getManyBase')
  async getMany(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Job) {
    try {
      const favorite = await this.service.getAllFavoriteJob();
      // const allJob = await this.base.getManyBase(req);
      // for (let i = 0; i < count(allJob); i++)
      const response: any = await this.base.getManyBase(req);

      let isFavorite: Array<any>;

      if (response.count) {
        isFavorite = response.data.map(job => {
          console.log('job', job);

          if (_.find(favorite, { jobId: job.id })) {
            job.isFavorite = true;
          } else {
            job.isFavorite = false;
          }
          return job;
        });
        return { ...response, data: isFavorite };
      } else {
        isFavorite = response.map(job => {
          console.log(_.find(favorite, { jobId: job.id }));
          if (_.find(favorite, { jobId: job.id })) {
            job.isFavorite = true;
          } else {
            job.isFavorite = false;
          }
          return job;
        });
      }
      return isFavorite;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Get('all')
  async getAll() {
    const allJob: any = await this.repository.find();
    const currentDate = new Date().toLocaleDateString();
    const checkJobDeadline = allJob.filter(job => {
      const parts = job.deadline.split('-');
      const jobDeadline = new Date(
        `${parts[1]}/${parts[2]}/${parts[0]}`,
      ).toLocaleDateString();
      return jobDeadline >= currentDate;
    });
    const favorite = await this.service.getAllFavoriteJob();
    const isFavorite = checkJobDeadline.map(job => {
      console.log(_.find(favorite, { jobId: job.id }));
      if (_.find(favorite, { jobId: job.id })) {
        job.isFavorite = true;
      } else {
        job.isFavorite = false;
      }

      return job;
    });
    return isFavorite;
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getFavoritesByUser(@UserSession() user: any) {
    const userId = user.users.id;
    return this.service.getFavoritesByUser(userId);
  }

  @Put('active')
  @Methods(methodEnum.UPDATE)
  async activeJob(@UserSession() user: any) {}

  @Get('inactive/all')
  async getInactiveJob(@Request() req) {
    const limit = req.query.hasOwnProperty('limit') ? req.query.limit : 10;
    const page = req.query.hasOwnProperty('page') ? req.query.page : 1;
    const sort = req.query.hasOwnProperty('sort') ? req.query.sort : null;

    try {
      return await this.repository.paginate(
        {
          limit,
          page,
          sort,
        },
        { relations: ['user'] },
        { condition: { status: false } },
      );
    } catch (err) {
      console.log('err', err);
    }
  }

  @Get('softdelete/all')
  @Methods(methodEnum.READ)
  async getSoftDeleteList(@Request() req) {
    const limit = req.query.hasOwnProperty('limit') ? req.query.limit : 10;
    const page = req.query.hasOwnProperty('page') ? req.query.page : 1;
    const sort = req.query.hasOwnProperty('sort') ? req.query.sort : null;
    console.log('limit', limit);
    return await this.repository.paginate(
      {
        limit,
        page,
        sort,
      },
      { relations: ['user'] },
      { condition: { deletedat: Not(IsNull()) } },
    );
  }

  @Get('applied')
  @Methods(methodEnum.READ)
  async getAppliedJobByCompany(@UserSession() user: any) {
    try {
      const userId = user.users.id;
      if (user.users.role === 'CONTRIBUTOR') {
        return this.service.getListUserAppliedJob(userId);
      } else if (user.users.role === 'USER') {
        return this.service.getJobAppliedByCompany(userId);
      } else {
        throw new HttpException(
          {
            message: 'Internal Server Error',
            status: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
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
