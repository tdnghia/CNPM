import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { MethodsEntity } from '../../entity/method.entity';
import * as methods from '../data/method.json';

export default class CreateMethods implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(MethodsEntity)
      .values(methods)
      .execute();
  }
}
