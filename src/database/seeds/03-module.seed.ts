import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { ModulesEntity } from '../../entity/module.entity';
import * as resources from '../data/module.json';

export default class CreateModules implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(ModulesEntity)
      .values(resources)
      .execute();
  }
}
