import { Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Methods } from 'src/common/decorators/method.decorator';
import { Modules } from 'src/common/decorators/module.decorator';
import { UserSession } from 'src/common/decorators/user.decorator';
import { methodEnum } from 'src/common/enums/method.enum';
import { ModuleEnum } from 'src/common/enums/module.enum';
import { EducationsEntity } from 'src/entity/education.entity';
import { EducationProfile } from 'src/entity/EducationProfile.entity';
import { Profile } from 'src/entity/profile.entity';
import { Repository } from 'typeorm';
import { EducationDTO } from './education.dto';
import { EducationService } from './education.service';

@ApiTags('api/v1/education')
@Controller('/api/v1/education')
@Modules(ModuleEnum.EDUCATION)
export class EducationController {
    constructor(
        public service: EducationService,
        @InjectRepository(EducationProfile)
        private readonly repository: Repository<EducationProfile>, // private readonly skillRepository: SkillRepository, // private readonly userRepository: UserRepository,
        @InjectRepository(EducationsEntity)
        private readonly educationRepository: Repository<EducationsEntity>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        // private readonly userRepository: 
    ) {}

    @Get()
    @Methods(methodEnum.READ)
    async getAll() {
      return await this.educationRepository.find();
    }

    @Post('/educationProfile')
    @Methods(methodEnum.CREATE)
    async createOne(@Body() dto: EducationDTO[], @UserSession() userSession) {
        try {
          const findProfile = await this.profileRepository.findOne({
            join: { alias: 'profile', innerJoin: { user: 'profile.user' } },
            where: qb => {
              qb.where('user.id = :id', { id: userSession.users.id });
            }
          });
    
          if (!findProfile) {
            return new NotFoundException('Profile was not Found');
          }

          for (let i = 0; i < dto.length; i++) {
            const findEducation = await this.educationRepository.findOne({ where: { id: dto[i].educationId } });

            if (!findEducation) {
              return new NotFoundException('Education was not Found');
            }
          }
          
          // delete all old record of that profileId before update
          const findByProfileId = await this.repository.delete({ profileId: findProfile.id });
          
          // create/update EducationProfile
          for (let i = 0; i < dto.length; i++) {
            const createProfileEducation = await this.repository.create({
              educationId: dto[i].educationId,
              profileId: findProfile.id,
              current: dto[i].current,
            });
            await this.repository.save(createProfileEducation);
          }
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
