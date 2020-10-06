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
  ConflictException,
  UsePipes,
} from '@nestjs/common';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { Modules } from 'src/common/decorators/module.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { BaseController } from 'src/common/Base/base.controller';
import { Category } from 'src/entity/category.entity';
import { CategoryService } from './categories.service';
import { CategoryRepository } from './categories.repository';
import {
  Override,
  ParsedRequest,
  CrudRequest,
  ParsedBody,
  Crud,
  CreateManyDto,
} from '@nestjsx/crud';
import { getSlug } from 'src/core/utils/helper';
import { Not, IsNull, UpdateResult } from 'typeorm';
import { methodEnum } from 'src/common/enums/method.enum';
import { Methods } from 'src/common/decorators/method.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { UserRepository } from '../users/user.repository';
import { LoginDTO } from '../auth/auth.dto';
import { CateDTO } from './categoryDTO.dto';

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
    join: {
      user: {
        eager: true,
        allow: ['id'],
      },
    },
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
    const author = await this.authorRepository.findOne({ id: user.users.id });
    if (!author) {
      throw new NotFoundException('User does not Exist');
    }
    dto.slug = getSlug(dto.name);
    dto.user = author;
    const category = await this.repository.findOne({
      where: { name: dto.name },
    });
    if (!category) {
      const data = await this.base.createOneBase(req, dto);
      return data;
    }

    throw new ConflictException('Category name already exists');
  }

  @Get('all')
  async getAll(@ParsedRequest() req: CrudRequest) {
    return await this.repository.findTrees();
  }

  @Override('getManyBase')
  @Methods(methodEnum.READ)
  async getMany(@ParsedRequest() req: CrudRequest) {
    return this.base.getManyBase(req);
  }

  @Override('replaceOneBase')
  @UsePipes(new ValidationPipe())
  async replaceOne(@ParsedRequest() req: CrudRequest) {
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
    return await this.repository.restore({ slug });
  }

  @Override('getOneBase')
  async getOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Category) {
    try {
      const data = await this.base.getOneBase(req);

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

  @Override('deleteOneBase')
  @Methods(methodEnum.DELETE)
  async softDelete(@ParsedRequest() req: CrudRequest): Promise<UpdateResult> {
    const slug = req.parsed.paramsFilter.find(
      f => f.field === 'slug' && f.operator === '$eq',
    ).value;

    const data = await this.repository.findOne({ where: { slug } });
    if (!data) {
      console.log('not found');

      throw new HttpException(
        {
          message: 'Not Found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      return await this.repository.softDelete({ slug });
    } catch (error) {
      throw new InternalServerErrorException('Incomplete CrudRequest');
    }
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
  @Methods(methodEnum.UPDATE)
  async updateOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: Category,
    @User() user,
  ): Promise<UpdateResult> {
    const slug = req.parsed.paramsFilter.find(
      f => f.field === 'slug' && f.operator === '$eq',
    ).value;
    const author = await this.authorRepository.findOne({
      id: user.users.id,
    });

    const result = await this.repository.findOne({ slug: slug });
    if (!result) {
      throw new HttpException(
        {
          message: 'Category Not Found',
          status: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const category = await this.repository.findOne({ name: dto.name });
    if (category) {
      throw new HttpException(
        {
          message: 'Category name already exists',
          status: HttpStatus.CONFLICT,
        },
        HttpStatus.CONFLICT,
      );
    }
    dto.slug = getSlug(dto.name);
    dto.user = author;
    return this.repository.update({ slug }, dto);
  }
}
