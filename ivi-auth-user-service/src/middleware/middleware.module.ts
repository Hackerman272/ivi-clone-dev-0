import { Module } from '@nestjs/common';
import {HttpModule} from "@nestjs/axios";
import {WakeUpMiddlewareMiddleware} from "./wakeup-middleware";

@Module({
    imports: [HttpModule],
    providers: [WakeUpMiddlewareMiddleware],
}) export class MiddlewareModule {}
