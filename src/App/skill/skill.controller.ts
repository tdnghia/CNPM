import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Methods } from 'src/common/decorators/method.decorator';
import { Modules } from 'src/common/decorators/module.decorator';
import { UserSession } from 'src/common/decorators/user.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { Skill } from 'src/entity/skill.entity';
import { UserRepository } from '../users/user.repository';
import { SkillService } from './skill.service';
import { SkillDTO } from './skill.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileSkill } from 'src/entity/ProfileSkill.entity';
import { Repository } from 'typeorm';

@ApiTags('api/v1/skill')
@Controller('/api/v1/skill')
@Modules(ModuleEnum.SKILL)
export class SkillController {
  constructor(
    public service: SkillService,
    @InjectRepository(ProfileSkill)
    private readonly repository: Repository<ProfileSkill>, // private readonly skillRepository: SkillRepository, // private readonly userRepository: UserRepository,
    private readonly userRepository: UserRepository,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  @Get()
  async getAllSkills() {
    return await this.skillRepository.find();
  }

  @Post()
  @Methods(methodEnum.CREATE)
  async createOne(@Body() dto: SkillDTO, @UserSession() userSession) {
    try {
      const findUser = await this.userRepository.findOne({
        where: { id: userSession.users.id },
        relations: ['profile'],
      });
      const findSkill = await this.skillRepository.findOne({
        where: { id: dto.skillId },
      });

      if (!findUser) {
        return new NotFoundException('User was not Found');
      }
      if (!findSkill) {
        return new NotFoundException('Skill was not Found');
      }

      const createSkill = this.repository.create({
        profileId: findUser.profile.id,
        skillId: findSkill.id,
        experience: dto.experience,
      });
      return await this.repository.save(createSkill);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Internal Server error',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @Methods(methodEnum.DELETE)
  async deleteOne(@Param('id') id: string) {
    try {
      const findSkill = await this.repository.findOne({ where: { id: id } });
      console.log('i', findSkill);
      if (!findSkill) {
        return new BadRequestException('Skill doesn not exists');
      }

      //   return await this.repository.delete({ id: findSkill.id });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          message: 'Internal Server error',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @Methods(methodEnum.UPDATE)
  async updateOne(@Param('id') id: string, @Body() dto: Skill) {
    try {
      const findSkill = await this.repository.findOne({ where: { id: id } });
      if (!findSkill) {
        return new BadRequestException('Skill doesn not exists');
      }

      //   return await this.repository.update({ id: findSkill.id }, dto);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          message: 'Internal Server error',
          status: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
