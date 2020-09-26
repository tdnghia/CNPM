import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { PermissionsEntity } from '../../entity/permission.entity';
import { ModulesEntity } from '../../entity/module.entity';
import { MethodsEntity } from '../../entity/method.entity';

export default class CreatePermissions implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const moduleRepository = connection.getRepository(ModulesEntity);
    const methodRepository = connection.getRepository(MethodsEntity);

    const modules = await moduleRepository.find();
    const methods = await methodRepository.find();

    for (let indexModule = 0; indexModule < modules.length; indexModule++) {
      for (let indexMethod = 0; indexMethod < methods.length; indexMethod++) {
        await connection
          .createQueryBuilder()
          .insert()
          .into(PermissionsEntity)
          .values([
            {
              methodId: methods[indexMethod].id,
              moduleId: modules[indexModule].id,
            },
          ])
          .execute();
      }
    }
  }
}
