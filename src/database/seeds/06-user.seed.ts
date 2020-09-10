import { Factory, Seeder } from 'typeorm-seeding';
import { Connection, getConnection } from 'typeorm';
import { User } from '../../entity/user.entity';
import * as bcrypt from 'bcrypt';
export default class CreateRoles implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          email: 'ngotruongquoc0102@gmail.com',
          name: 'Truong Quoc',
          password: await bcrypt.hash('admin', 12),
          phone: '0764483638',
          roleId: 1,
        },
      ])
      .execute();
    await factory(User)({ roles: ['Member'] }).createMany(5);
  }
}
