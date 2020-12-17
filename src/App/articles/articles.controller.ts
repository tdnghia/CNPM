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
import { Methods } from 'src/common/decorators/method.decorator';
import { Modules } from 'src/common/decorators/module.decorator';
import { UserSession } from 'src/common/decorators/user.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { getSlug } from 'src/core/utils/helper';
import { Article } from 'src/entity/article.entity';
import { IsNull, Not } from 'typeorm';
import { CategoryRepository } from '../categories/categories.repository';
import { UserRepository } from '../users/user.repository';
import { ArticleRepository } from './articles.repository';
import { ArticlesService } from './articles.service';

@Crud({
  model: {
    type: Article,
  },
  params: {
    slug: {
      field: 'slug',
      type: 'string',
      primary: true,
    },
  },
})
@ApiTags('v1/articles')
@Controller('/api/v1/articles')
@Modules(ModuleEnum.ARTICLE)
export class ArticlesController extends BaseController<Article> {
  constructor(
    public service: ArticlesService,
    private readonly repository: ArticleRepository,
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {
    super(repository);
  }

  @Override('createOneBase')
  @Methods(methodEnum.CREATE)
  async createOne(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: Article,
    @UserSession() user: any,
  ) {
    try {
      const findUser = await this.userRepository.findOne({ id: user.users.id });
      const findCategory = await this.categoryRepository.findOne({
        id: dto.categoryId,
      });
      dto.slug = getSlug(dto.title);
      dto.user = findUser;
      dto.category = findCategory;
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

  @Override('getOneBase')
  async getOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Article) {
    try {
      const data = await this.base.getOneBase(req);
      return data;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Article not found',
          error: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('updateOne/:slug')
  async updateUser(
    @Body() dto: Partial<Article>,
    @Param('slug') slugParam: string,
  ) {
    try {
      const result = await this.repository.findOne({ slug: slugParam });
      if (!result) {
        throw new HttpException(
          {
            message: 'Not Found',
            status: HttpStatus.NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const findCategory = await this.categoryRepository.findOne({
        id: dto.categoryId,
      });
      dto.category = findCategory;
      dto.slug = getSlug(dto.title);
      const { title, content, salary_range, slug } = dto;
      return await this.repository.update({ slug: result.slug }, dto);
      // this.repository.find({where: {user: {address: }}})
    } catch (error) {
      console.log(error);
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

  @Override('updateOneBase')
  async restore(@ParsedRequest() req: CrudRequest): Promise<void> {
    const slug = req.parsed.paramsFilter.find(
      f => f.field === 'slug' && f.operator === '$eq',
    ).value;

    const data = await this.repository.findOne({
      withDeleted: true,
      where: { slug, deletedat: Not(IsNull()) },
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

  @Delete('/delete/:slug')
  async forceDelete(
    @ParsedRequest() req: CrudRequest,
    @Param('slug') slug: string,
  ): Promise<void> {
    console.log(slug);
    const data = this.repository.findOne({
      where: { slug, deletedat: IsNull() },
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
      await this.repository.delete({ slug, deletedat: IsNull() });
    } catch (error) {
      throw new InternalServerErrorException('Incomplete CrudRequest');
    }
  }
}
