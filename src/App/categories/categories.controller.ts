import { Controller, HttpException, HttpStatus, Get, Put, Body, Param, InternalServerErrorException } from '@nestjs/common';
import { Modules } from 'src/common/decorators/module.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { BaseController } from 'src/common/Base/base.controller';
import { Category } from 'src/entity/category.entity';
import { CategoryService } from './categories.service';
import { CategoryRepository } from './categories.repository';
import { Override, ParsedRequest, CrudRequest, ParsedBody, Crud } from '@nestjsx/crud';
import { getSlug, slugToName } from 'src/core/utils/helper';
import { Not, IsNull } from 'typeorm';

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

        },
    },
})

@ApiTags('v1/categories')
@Controller('/api/v1/categories')
@Modules(ModuleEnum.CATEGORY)
export class CategoriesController extends BaseController<Category> {
    constructor(
        public service: CategoryService,
        private readonly repository: CategoryRepository,
    ) {
        super(repository);
    }

    @Override('createOneBase')
    async createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Category) {
        try {
            const category = await this.repository.findOne({ where: { name: dto.name } });
            if (!category) {
                dto.slug = getSlug(dto.name);
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

    @Override('getOneBase')
    async getOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Category) {
        try {
            const data = await this.base.getOneBase(req);
            return data;
        } catch (error) {
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
    async updateUser(@Body() dto: Partial<Category>, @Param('slug') slug: string) {
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
