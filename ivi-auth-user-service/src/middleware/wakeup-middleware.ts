import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {HttpService} from "@nestjs/axios";

// необходимо чтобы profile-service на бесплатном хостинге просыпался и начинал читать RabbitMQ

@Injectable()
export class WakeUpMiddlewareMiddleware implements NestMiddleware {
    constructor(private readonly httpService: HttpService) {}
    async use(req: Request, res   : Response, next: NextFunction) {
        await this.httpService.get('https://ivi-profile-service.onrender.com/profile/ping');
        console.log('sent ping')
        next();
    }
}
