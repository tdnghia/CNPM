import { Seeder, Factory } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from '../../entity/user.entity';
import { Category } from '../../entity/category.entity';
import * as cateBySkill from '../data/cateBySkill.json';
import * as cateByLevel from '../data/cateByLevel.json';
import * as cateByCompany from '../data/cateByCompany.json';

export default class CreateCategories implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const userRepository = connection.getRepository(User);
    const categoryRepository = connection.getTreeRepository(Category);
    const user = await userRepository.find();

    const TopCate = [
      { name: 'Theo khả năng', user: user[Math.floor(Math.random() * 6)] },
      {
        name: 'Việc làm theo cấp bậc',
        user: user[Math.floor(Math.random() * 6)],
      },
      {
        name: 'viec lam theo cong ty',
        user: user[Math.floor(Math.random() * 6)],
      },
      { name: 'Tester', user: user[Math.floor(Math.random() * 6)] },
      { name: 'Senior', user: user[Math.floor(Math.random() * 6)] },
      { name: 'Android', user: user[Math.floor(Math.random() * 6)] },
      { name: '.NET', user: user[Math.floor(Math.random() * 6)] },
      { name: 'IOS', user: user[Math.floor(Math.random() * 6)] },
      { name: 'Business Analyst', user: user[Math.floor(Math.random() * 6)] },
    ];

    console.log('cate', cateBySkill);

    for (let index = 0; index < TopCate.length; index++) {
      await factory(Category)({
        payload: TopCate[index],
      }).create();
    }

    const cateParent = await categoryRepository.findRoots();

    for (let index = 0; index < cateBySkill.length; index++) {
      await factory(Category)({
        payload: cateBySkill[index],
        parent: cateParent[0],
      }).create();
    }

    for (let index = 0; index < cateByLevel.length; index++) {
      await factory(Category)({
        payload: cateByLevel[index],
        parent: cateParent[1],
      }).create();
    }

    for (let index = 0; index < cateByLevel.length; index++) {
      await factory(Category)({
        payload: cateByCompany[index],
        parent: cateParent[2],
      }).create();
    }
  }
}
