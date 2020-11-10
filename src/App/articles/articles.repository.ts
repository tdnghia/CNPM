import { BaseRepository } from 'src/common/Base/base.repository';
import { Article } from 'src/entity/article.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Article)
export class ArticleRepository extends BaseRepository<Article> {}
