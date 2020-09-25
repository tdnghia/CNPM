import { define, factory } from 'typeorm-seeding';
import * as Faker from 'faker';
import { Jobs } from '../../entity/job.entity';
import { getSlug } from '../../core/utils/helper';
import { getManager } from 'typeorm';
import { Tag } from '../../entity/tag.entity';

define(Jobs, (faker: typeof Faker, context: { payload?: Jobs }) => {
  const { payload } = context;
  const name = payload.name;
  const slug = getSlug(name);
  const job = new Jobs();
  const manager = getManager();
  job.name = name;
  job.slug = slug;
  job.content = payload.content;
  job.description = payload.description;
  job.lowestWage = payload.lowestWage;
  job.highestWage = payload.highestWage;
  job.type = payload.type;
  job.experience = payload.experience;
  job.deadline = payload.deadline;
  job.user = payload.user;
  job.category = payload.category;
  return job;
});
