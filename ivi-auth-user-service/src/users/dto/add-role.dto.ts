import {IsNumber, IsString} from "class-validator";

export class AddRoleDto {

    @IsString({message: "Нужна строка"})
    readonly value: string;
    @IsNumber({}, {message: "Нужно число"})
    readonly userId: number;
}
