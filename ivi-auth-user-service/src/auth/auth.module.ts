import {forwardRef, Module} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import * as process from "process";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ClientProxyFactory, Transport} from "@nestjs/microservices";
import {RolesModule} from "../roles/roles.module";
import {HttpModule} from "@nestjs/axios";
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "../users/user.model";
import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-roles.model";

@Module({
  controllers: [AuthController],
  providers: [AuthService,
      {
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
      // предотвращаем кольцевую зависимость
      HttpModule,
      forwardRef( () => UsersModule),
      forwardRef( () => RolesModule),
      SequelizeModule.forFeature([UserRoles]),
      ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`
      }),
      JwtModule.register({
        secret: process.env.PRIVATE_KEY || "SECRET",
        signOptions: {
          expiresIn: '24h'
        }
      })
  ],
    exports: [
        AuthModule,
        AuthService,
        JwtModule
    ]
})
export class AuthModule {}
