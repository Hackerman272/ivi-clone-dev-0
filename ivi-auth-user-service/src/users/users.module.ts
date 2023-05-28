import {forwardRef, Module} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "./user.model";
import {Role} from "../roles/roles.model";
import {RolesModule} from "../roles/roles.module";
import {UserRoles} from "../roles/user-roles.model";
import {AuthModule} from "../auth/auth.module";
import {ClientProxyFactory, ClientsModule, Transport} from "@nestjs/microservices";
import {ConfigModule, ConfigService} from "@nestjs/config";
import * as process from "process";

@Module({
  controllers: [UsersController],
  providers: [UsersService, {
      provide: 'PROFILE_SERVICE',
      useFactory: (configService: ConfigService) => {
          const user = configService.get('RABBITMQ_USER');
          const password = configService.get('RABBITMQ_PASSWORD');
          const host = configService.get('RABBITMQ_HOST');
          const queueName = configService.get('RABBITMQ_QUEUE_NAME_USER_PROFILE');
          const rabbitMQ_cloud_url = configService.get('RABBITMQ_CLOUD_URL')

          return ClientProxyFactory.create({
              transport: Transport.RMQ,
              options: {
                  urls: [`amqp://${rabbitMQ_cloud_url}`],
                  // urls: [`amqp://${user}:${password}@${host}/`],
                  queue: queueName,
                  queueOptions: {
                      durable: true,
                  },
              },
          })
      },
      inject: [ConfigService],
  }],
  imports: [
      ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`
      }),
      SequelizeModule.forFeature([User, Role, UserRoles]),
      RolesModule,
      // боремся с кольцевой зависимостью auth и user
      forwardRef( () => AuthModule)],
    exports: [
        UsersService,
    ]
})
export class UsersModule {}
