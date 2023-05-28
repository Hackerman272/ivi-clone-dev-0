import {ApiProperty} from "@nestjs/swagger";
import {IsNumber} from "class-validator";

export class DeleteProfileDto {
    @ApiProperty({example: '123', description: "id профиля"})
    @IsNumber()
    readonly profileId: number;
}
