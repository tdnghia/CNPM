import { Module } from '@nestjs/common';
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
<<<<<<< HEAD
import { RolesModule } from './App/roles/roles.module';
import { JobsModule } from './App/jobs/jobs.module';
=======
>>>>>>> a038eb65204316e8f8b437a7153ea18ee60b4578

// import { PermissionController } from './permission/permission.controller';
@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    CategoriesModule,
    PermissionModule,
    AuthModule,
    JobsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    MulterModule.register({
      dest: './uploads',
    }),
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
export class AppModule {}
