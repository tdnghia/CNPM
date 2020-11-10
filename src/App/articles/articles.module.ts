import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from 'src/entity/article.entity';
import { User } from '../../entity/user.entity';
import { Category } from 'src/entity/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, User, Category])],
  providers: [ArticlesService],
  controllers: [ArticlesController]
})
export class ArticlesModule {}
