import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  Crud,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@nestjsx/crud';
import { BaseController } from 'src/common/Base/base.controller';
import { Modules } from 'src/common/decorators/module.decorator';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { getSlug } from 'src/core/utils/helper';
import { Job } from 'src/entity/job.entity';
import { IsNull, Not } from 'typeorm';
import { JobRepository } from './jobs.repository';
import { JobService } from './jobs.service';

@Crud({
  model: {
    type: Job,
  },
  params: {
    slug: {
      field: 'slug',
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
  async createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Job) {
    try {
      dto.slug = getSlug(dto.name);
      const data = await this.base.createOneBase(req, dto);
      return data;
    } catch (error) {
      console.log('err', error);
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

  @Put('updateOne/:slug')
  async updateUser(@Body() dto: Partial<Job>, @Param('slug') slug: string) {
    try {
      const result = await this.repository.findOne({ slug: slug });
      if (!result) {
        throw new HttpException(
          {
            message: 'Not Found',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      dto.slug = getSlug(dto.name);
      return await this.repository.update({ slug }, dto);
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
    const slug = req.parsed.paramsFilter.find(
      f => f.field === 'slug' && f.operator === '$eq',
    ).value;

    const data = this.repository.findOne({ where: { slug } });
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
      await this.repository.softDelete({ slug });
    } catch (error) {
      throw new InternalServerErrorException('Incomplete CrudRequest');
    }
  }

  @Delete('/delete/:slug')
  async forceDelete(
    @ParsedRequest() req: CrudRequest,
    @Param('slug') slug: string,
  ): Promise<void> {
    console.log(slug);

    const data = this.repository.findOne({
      where: { slug, deletedAt: IsNull() },
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
      await this.repository.delete({ slug, deletedAt: IsNull() });
    } catch (error) {
      throw new InternalServerErrorException('Incomplete CrudRequest');
    }
  }
  @Override('updateOneBase')
  async restore(@ParsedRequest() req: CrudRequest): Promise<void> {
    const slug = req.parsed.paramsFilter.find(
      f => f.field === 'slug' && f.operator === '$eq',
    ).value;

    const data = await this.repository.findOne({
      withDeleted: true,
      where: { slug, deletedAt: Not(IsNull()) },
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
    await this.repository.restore({ slug });
  }
}
