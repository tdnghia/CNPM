import {
  Controller,
  HttpException,
  HttpStatus,
  Get,
  Put,
  Body,
  Param,
  InternalServerErrorException,
  Req,
  SetMetadata,
  NotFoundException,
} from '@nestjs/common';
import { Modules } from 'src/common/decorators/module.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { BaseController } from 'src/common/Base/base.controller';
import { Category } from 'src/entity/category.entity';
import { CategoryService } from './categories.service';
import { CategoryRepository } from './categories.repository';
import { Request } from 'express';
import {
  Override,
  ParsedRequest,
  CrudRequest,
  ParsedBody,
  Crud,
  CreateManyDto,
} from '@nestjsx/crud';
import { getSlug } from 'src/core/utils/helper';
import { Not, IsNull } from 'typeorm';
import { methodEnum } from 'src/common/enums/method.enum';
import { Methods } from 'src/common/decorators/method.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { UserRepository } from '../users/user.repository';

@Crud({
  model: {
    type: Category,
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
    join: {},
  },
})
@ApiTags('v1/categories')
@Controller('/api/v1/categories')
@Modules(ModuleEnum.CATEGORY)
@SetMetadata('entity', ['categories'])
export class CategoriesController extends BaseController<Category> {
  constructor(
    public service: CategoryService,
    private readonly repository: CategoryRepository,
    private readonly authorRepository: UserRepository,
  ) {
    super(repository);
  }

  @Override('createManyBase')
  async createMany(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateManyDto<Category>,
  ) {
    console.log('dto', dto);
  }
  @Override('createOneBase')
  @Methods(methodEnum.CREATE)
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: Category,
    @User() user: any,
  ) {
    try {
      console.log('user', user);

      const author = await this.authorRepository.findOne({ id: user.users.id });
      if (!author) {
        throw new NotFoundException('User does not Exist');
      }
      const category = await this.repository.findOne({
        where: { name: dto.name },
      });
      if (!category) {
        dto.slug = getSlug(dto.name);
        dto.user = author;
        const data = await this.base.createOneBase(req, dto);
        return data;
      }
      throw new HttpException(
        {
          message: 'Category name already exists',
          status: HttpStatus.CONFLICT,
        },
        HttpStatus.CONFLICT,
      );
    } catch (error) {
      console.log('eerr', error);

      throw new HttpException(
        {
          message: 'Internal Server error',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Override('getOneBase')
  async getOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Category) {
    try {
      console.log('nheree');
      const data = await this.base.getOneBase(req);
      console.log('data', data);

      if (!data) {
        throw new HttpException(
          {
            message: 'Category not found',
            error: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return data;
    } catch (error) {
      console.log('error', error);

      throw new HttpException(
        {
          message: 'Category not found',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('updateOne/:slug')
  @Methods(methodEnum.UPDATE)
  async updateOne(
    @Body() dto: Partial<Category>,
    @Param('slug') slug: string,
    @Req() req: Request,
  ) {
    try {
      console.log('working');
      // const result = await this.repository.findOne({ slug: slug });
      // if (!result) {
      //   throw new HttpException(
      //     {
      //       message: 'Not Found',
      //       status: HttpStatus.NOT_FOUND,
      //     },
      //     HttpStatus.NOT_FOUND,
      //   );
      // }
      // const category = await this.repository.findOne({ name: dto.name });
      // if (category) {
      //   throw new HttpException(
      //     {
      //       message: 'Category name already exists',
      //       status: HttpStatus.CONFLICT,
      //     },
      //     HttpStatus.CONFLICT,
      //   );
      // }
      // dto.slug = getSlug(dto.name);
      // return await this.repository.update({ slug }, dto);
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

  @Get('all')
  async getAll(@ParsedRequest() req: CrudRequest) {
    return await this.repository.findTrees();
  }

  /**
   * Get Category By Id
   * @param req
   * @param dto
   * @param id
   */
  @Get(':id')
  async getCategory(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: Category,
    @Param('id') id: number,
  ) {
    return await this.repository.findOne({
      where: { id },
      relations: ['children'],
    });
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
