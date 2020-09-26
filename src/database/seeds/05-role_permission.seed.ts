import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { RolePermission } from '../../entity/role_permission.entity';
import { PermissionsEntity } from '../../entity/permission.entity';

export default class CreateRolePermission implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    // const rolePermission = connection.getRepository(RolePermission);
    const permission = connection.getRepository(PermissionsEntity);

    const getListPermission = await permission.find();

    for (let index = 0; index < getListPermission.length; index++) {
      await connection
        .createQueryBuilder()
        .insert()
        .into(RolePermission)
        .values({
          roleId: 1,
          permissionId: getListPermission[index].id,
          posession: 'any',
        })
        .execute();
    }
  }
}
