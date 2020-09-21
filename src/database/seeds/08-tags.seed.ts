import { Tag } from '../../entity/tag.entity';
import { User } from '../../entity/user.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import * as _ from 'lodash';
import * as tags from '../data/tags.json';

export default class TagSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const userRepository = connection.getRepository(User);
    const tagRepository = connection.getRepository(Tag);
    const newTags = [];
    const user = await userRepository.find();

    for (let index = 0; index < tags.length; index++) {
      tags[index].tag.forEach(async tag => {
        if (_.indexOf(newTags, tag) < 0) {
          newTags.push(tag);
        }
      });
    }
    for (let index = 0; index < newTags.length; index++) {
      await factory(Tag)({
        payload: {
          name: newTags[index],
          author: user[Math.floor(Math.random() * 6)],
        },
      }).create();
    }
  }
}
