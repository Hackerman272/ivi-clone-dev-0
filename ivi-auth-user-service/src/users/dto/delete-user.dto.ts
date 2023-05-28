import {IsNumber, IsOptional} from "class-validator";

export class DeleteUserDto {
    readonly userId: number;

    @IsNumber()
    @IsOptional()
    profileId: number;
}
