import {MiddlewareConsumer, Module} from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import * as process from "process";
import {User} from "./users/user.model";
import {Role} from "./roles/roles.model";
import { RolesModule } from './roles/roles.module';
import {UserRoles} from "./roles/user-roles.model";
import { AuthModule } from './auth/auth.module';
import { MiddlewareModule } from './middleware/middleware.module';
import {WakeUpMiddlewareMiddleware} from "./middleware/wakeup-middleware";
import {HttpModule} from "@nestjs/axios";


@Module({
  controllers: [],
  providers: [],
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      // uri: process.env.DATABASE_URL,
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB_USERS_AUTH,
      models: [User, Role, UserRoles],
      autoLoadModels: true
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    MiddlewareModule
  ],
  exports: [SequelizeModule, AppModule]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(WakeUpMiddlewareMiddleware)
        .forRoutes('auth', 'users');
  }
}
