import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudRequest, Override, ParsedBody, ParsedRequest } from '@nestjsx/crud';
import { BaseController } from 'src/common/Base/base.controller';
import { getSlug } from 'src/core/utils/helper';
import { Article } from 'src/entity/article.entity';
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
    }
})
@ApiTags('v1/articles')
@Controller('/api/v1/articles')
export class ArticlesController extends BaseController<Article> {
    constructor(
        public service: ArticlesService,
        private readonly repository: ArticleRepository,
    ) {
        super(repository);
    }

    @Override('createOneBase')
    async createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: Article) {
        console.log('here');
    }
}
