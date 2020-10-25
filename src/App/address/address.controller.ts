import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/Base/base.controller';
import { Address } from 'src/entity/address.entity';
import { AddressService } from './address.service';
import { AddressRepository } from './address.repository';
import { Crud, Override, ParsedBody } from '@nestjsx/crud';
import { UserSession } from 'src/common/decorators/user.decorator';
import { UserRepository } from '../users/user.repository';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { getManager } from 'typeorm';

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

  @Get('own')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getOwnAddress(@UserSession() user: any) {
    const manager = getManager();
    const currentUser = await this.userRepository.findOne({
      id: user.users.id,
    });
    if (!currentUser) {
      throw new NotFoundException('User not Found');
    }
    const addressIds = await manager.query(
      `SELECT "addressId" FROM user_address WHERE "userId"='${currentUser.id}'`,
    );
    const addrIds = addressIds.map(data => data.addressId);

    return this.repository.findByIds(addrIds);
  }

  @Override('createOneBase')
  async createOne(@UserSession() currentUser, @ParsedBody() body: Address) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser.users.id },
    });
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
