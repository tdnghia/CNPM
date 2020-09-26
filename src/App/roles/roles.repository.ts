import { Role } from 'src/entity/role.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Role)
export class RolesRepository extends Repository<Role> {}
