import { Factory, Seeder } from 'typeorm-seeding';
import { Connection, getConnection } from 'typeorm';
import { User } from '../../entity/user.entity';
import * as bcrypt from 'bcrypt';
import * as user from '../data/user.json';

export default class CreateRoles implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          email: 'admin@gmail.com',
          password: await bcrypt.hash('admin', 12),
          roleId: 1,
        },
      ])
      .execute();
    // for (let index = 0; index < user.length; index++) {
    //   await getConnection()
    //     .createQueryBuilder()
    //     .insert()
    //     .into(User)
    //     .values([
    //       {
    //         ...user[index],
    //         password: await bcrypt.hash('admin', 12),
    //       },
    //     ])
    //     .execute();
    // }
    await factory(User)({ roles: ['Member'] }).createMany(10);
  }
}
