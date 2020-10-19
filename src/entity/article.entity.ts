import { ApiProperty } from '@nestjs/swagger';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { extend } from 'lodash';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Base } from './base.entity';
import { Category } from './category.entity';
import { User } from './user.entity';
const { CREATE, UPDATE } = CrudValidationGroups;

@Entity('articles')
export class Article extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Tiêu đề bài viết' })
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @Column({ type: 'text' })
  title: string;

  @ApiProperty({ example: 'Nội dung bài viết' })
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ example: 'Khoản lương đưa ra' })
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @Column({ type: 'text' })
  salary_range: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @IsOptional()
  @Column({ type: 'text' })
  slug: string;

  /**
   * The relationship between Article and Job
   */
  @ManyToOne(
    type => User,
    user => user.articles,
  )
  user: User;

  /**
   * The relationship between Article and Category
   */
  @ManyToOne(
    type => Category,
    category => category.articles,
  )
  category: Category;
}
