import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Article } from 'src/entity/article.entity';
import { ArticleRepository } from './articles.repository';

@Injectable()
export class ArticlesService extends TypeOrmCrudService<Article> {
    constructor(
        @InjectRepository(Article) repo,
        private readonly articleRepository: ArticleRepository,
    ) {
        super(repo);
    }
}
