import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsOptional, IsPhoneNumber, IsString, Length, MaxLength} from "class-validator";

export class CreateProfileDto {
    @ApiProperty({example: 'Василий', description: "Имя"})
    @IsString({message: "Должна быть строка"})
    @Length(1, 30, {message: 'От 1 по 30 символов'})
    readonly name: string;

    @ApiProperty({example: 'Васильев', description: "Фамилия"})
    @IsString({message: "Должна быть строка"})
    @Length(1, 30, {message: 'От 1 по 30 символов'})
    @IsOptional()
    readonly surname: string;

    @ApiProperty({example: 'Васильевич', description: "Отчество"})
    @IsOptional()
    @IsString({message: "Должна быть строка"})
    @MaxLength(30, {message: 'до 30 символов'})
    @IsOptional()
    readonly middleName: string;

    @ApiProperty({example: '8-800-555-35-35', description: "Отчество"})
    @IsString({message: "Должна быть строка"})
    @IsPhoneNumber('RU')
    @IsOptional()
    readonly phoneNumber: string;
}
