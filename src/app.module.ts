import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './App/users/users.module';
import { CategoriesModule } from 'src/App/categories/categories.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './App/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from 'src/config/typeorm.config';
import { HttpErorFilter } from 'src/shared/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/TransformInterceptor';
import { PermissionModule } from './App/permission/permission.module';
import { JobsModule } from './App/jobs/jobs.module';
import { AuthorizationMiddleware } from './core/middleware/authorization.middleware';
import { ArticlesModule } from './App/articles/articles.module';
import { AddressModule } from './App/address/address.module';
import { UploadModule } from './App/upload/upload/upload.module';
import { SkillModule } from './App/skill/skill.module';
import { EducationModule } from './App/education/education/education.module';
import { ExperienceModule } from './App/experience/experience.module';
import { NotificationsModule } from './App/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    CategoriesModule,
    PermissionModule,
    AuthModule,
    AddressModule,
    JobsModule,
    UploadModule,
    ArticlesModule,
    SkillModule,
    EducationModule,
    NotificationsModule,
    ExperienceModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpErorFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    AppService,
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AuthorizationMiddleware).forRoutes({
  //     path: 'api/v1/categories/updateOne/:slug',
  //     method: RequestMethod.PUT,
  //   });
  // }
}
