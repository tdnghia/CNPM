import { Article } from '../../entity/article.entity';
import { define } from 'typeorm-seeding';
import * as Faker from 'faker';
import { getSlug } from '../../core/utils/helper';

define(Article, (faker: typeof Faker, context: { payload?: Article }) => {
  const { payload } = context;
  const title = payload.title || faker.lorem.sentence(5);
  const slug = getSlug(title);

  const article = new Article();
  article.title = title;
  article.slug = slug;
  article.user = payload.user;
  article.content = faker.lorem.paragraph();
  // article.salary_range = payload.salaryRange;salaryRange

  return article;
});
