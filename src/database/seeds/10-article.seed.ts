import { Seeder, Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from '../../entity/user.entity';
import { Category } from '../../entity/category.entity';
import { Article } from '../../entity/article.entity';

export default class CreateArticles implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const userRepository = connection.getRepository(User);
    const categoryRepository = connection.getRepository(Category);
    const articleRepository = connection.getRepository(Article);

    const user = await userRepository.find({ roleId: 3 });
    const category = await categoryRepository.find();
    console.log(category);
    for (let i = 0; i < 50; i++) {
      await factory(Article)({
        payload: {
          user: user[Math.floor(Math.random() * user.length)].id,
          category: category[Math.floor(Math.random() * category.length)].id,
          salaryRange: '1000 - 2000',
        },
      }).create();
    }
  }
}
