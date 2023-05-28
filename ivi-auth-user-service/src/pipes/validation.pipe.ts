import {ArgumentMetadata, Injectable, PipeTransform} from "@nestjs/common";
import {plainToClass} from "class-transformer";
import {validate} from "class-validator";
import {ValidationException} from "../exceptions/validation.exception";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        // устарело? найти в документации альтернативу
        const obj = plainToClass(metadata.metatype, value);
        const errors = await validate(obj);
        if (errors.length) {
            let messages = errors.map(err => {
                return `${err.property} - ${Object.values(err.constraints).join(', ')}` // название поля, не прошедшего валидацию
            })
            throw  new ValidationException(messages)
        }
        return value;
    }
}
