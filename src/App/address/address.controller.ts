import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/Base/base.controller';
import { Address } from 'src/entity/address.entity';
import { AddressService } from './address.service';
import { AddressRepository } from './address.repository';
import { Crud, Override, ParsedBody } from '@nestjsx/crud';
import { UserSession } from 'src/common/decorators/user.decorator';
import { UserRepository } from '../users/user.repository';

@Crud({
  model: {
    type: Address,
  },
  params: {
    id: {
      field: 'id',
      type: 'string',
      primary: true,
    },
  },
  query: {
    limit: 10,
    maxLimit: 50,
    alwaysPaginate: true,
  },
})
@ApiTags('v1/addresses')
@Controller('api/v1/address')
export class AddressController extends BaseController<Address> {
  constructor(
    public service: AddressService,
    private readonly repository: AddressRepository,
    private readonly userRepository: UserRepository,
  ) {
    super(repository);
  }
  @Override('createOneBase')
  async createOne(@UserSession() currentUser, @ParsedBody() body: Address) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser.users.id },
    });
    body.user = user;
    const result = this.repository.create(body);
    await this.repository.save(result);
    return result;
  }
  @Override('getManyBase')
  async getMany(@UserSession() currentUser) {
    const result = await this.userRepository.find({
      where: { id: currentUser.users.id },
      relations: ['addresses'],
    });
    return result;
  }
}
