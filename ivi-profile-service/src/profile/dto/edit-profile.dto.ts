import {IsNumber, IsOptional, IsPhoneNumber, IsString, Length, MaxLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class EditProfileDto {
    @ApiProperty({example: '123', description: "id профиля"})
    @IsNumber()
    readonly profileId: number;

    @ApiProperty({example: 'Василий', description: "Имя"})
    @IsOptional()
    @IsString({message: "Должна быть строка"})
    @Length(1, 30, {message: 'От 1 по 30 символов'})
    readonly name: string;

    @ApiProperty({example: 'Васильев', description: "Фамилия"})
    @IsOptional()
    @IsString({message: "Должна быть строка"})
    @Length(1, 30, {message: 'От 1 по 30 символов'})
    readonly surname: string;

    @ApiProperty({example: 'Васильевич', description: "Отчество"})
    @IsOptional()
    @IsString({message: "Должна быть строка"})
    @MaxLength(30, {message: 'до 30 символов'})
    readonly middleName: string;

    @ApiProperty({example: '8-800-555-35-35', description: "Отчество"})
    @IsOptional()
    @IsString({message: "Должна быть строка"})
    @IsPhoneNumber('RU')
    readonly phoneNumber: string;
}
