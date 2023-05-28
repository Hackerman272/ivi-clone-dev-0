import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNumber, IsOptional, IsPhoneNumber, IsString, Length, MaxLength} from "class-validator";

export class RegistrationDto {
    @ApiProperty({example: 'test@test.com', description: "Уникальный адрес почты"})
    @IsString({message: "Должна быть строка"})
    @IsEmail({}, {message: "не email"})
    readonly email: string;

    @ApiProperty({example: '654321', description: "Пароль пользователя"})
    @IsString({message: "Должна быть строка"})
    @Length(4, 16, {message: 'От 4 по 16 символов'})
    readonly password: string;

    @ApiProperty({example: 'Василий', description: "Имя"})
    @IsString({message: "Должна быть строка"})
    @Length(0, 30, {message: 'От 1 по 30 символов'})
    readonly name: string;

    @ApiProperty({example: 'Васильев', description: "Фамилия"})
    @IsString({message: "Должна быть строка"})
    @Length(0, 30, {message: 'От 1 по 30 символов'})
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

    @ApiProperty({example: 53343, description: "id пользователя"})
    @IsNumber()
    @IsOptional()
    readonly vk_id: number;

    @ApiProperty({example: 53343, description: "id пользователя"})
    @IsString()
    @IsOptional()
    readonly vk_access_token: string;
}
