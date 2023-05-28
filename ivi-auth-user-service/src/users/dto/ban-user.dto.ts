import {IsNumber, IsOptional, IsString} from "class-validator";

export class BanUserDto {
    @IsNumber()
    readonly userId: number;

    @IsString()
    readonly banReason: string;

    @IsNumber()
    @IsOptional()
    profileId: number;
}
