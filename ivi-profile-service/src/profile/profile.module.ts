import {forwardRef, Module} from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {Profile} from "./profile.model";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ClientProxyFactory, Transport} from "@nestjs/microservices";
import * as process from "process";

@Module({
  controllers: [ProfileController],
  providers: [ProfileService,
    {
      provide: 'USER_AUTH_SERVICE',
      useFactory: (configService: ConfigService) => {
        const user = configService.get('RABBITMQ_USER');
        const password = configService.get('RABBITMQ_PASSWORD');
        const host = configService.get('RABBITMQ_HOST');
        const queueName = configService.get('RABBITMQ_QUEUE_NAME_PROFILE_USER');
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
    SequelizeModule.forFeature([Profile]),
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`
    }),
  ],
  exports: [
    ProfileService,
  ]
})
export class ProfileModule {}
