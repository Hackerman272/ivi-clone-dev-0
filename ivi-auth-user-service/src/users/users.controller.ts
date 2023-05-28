import {Body, Controller, Get, Post, Request, UseGuards, UsePipes} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {UsersService} from "./users.service";
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {User} from "./user.model";
import {RolesGuard} from "../auth/roles.guard";
import {Roles} from "../auth/roles-auth.decorator";
import {AddRoleDto} from "./dto/add-role.dto";
import {BanUserDto} from "./dto/ban-user.dto";
import {ValidationPipe} from "../pipes/validation.pipe";
import {EventPattern} from "@nestjs/microservices";
import {DeleteUserDto} from "./dto/delete-user.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) {

    }

    @ApiOperation({summary: "Создание пользователя"})
    @ApiResponse({status: 200, type: User})
    @UsePipes(ValidationPipe)
    @Post()
    create(@Body() userDto: CreateUserDto) {
        return this.userService.createUser(userDto);
    }

    @ApiOperation({summary: "Получить всех пользователей"})
    @ApiResponse({status: 200, type: [User]})
    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Get()
    getAll(){
        return this.userService.getAllUsers();
    }

    @ApiOperation({summary: "Получить информацию по себе"})
    @ApiResponse({status: 200, type: [User]})
    @Roles("ADMIN", "USER")
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Get('/me')
    getMe(@Request() req){
        return this.userService.getMe(req.user.id);
    }

    @ApiOperation({summary: "Раздача ролей"})
    @ApiResponse({status: 200})
    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Post('/role')
    addRole(@Body() dto: AddRoleDto){
        return this.userService.addRole(dto);
    }

    @ApiOperation({summary: "Бан пользователя"})
    @ApiResponse({status: 200})
    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Post('/ban')
    ban(@Body() dto: BanUserDto){
        return this.userService.ban(dto);
    }


    @EventPattern('user_ban')
    banRmq(@Body() dto: BanUserDto){
        return this.userService.ban(dto);
    }

    @ApiOperation({summary: "Удаление пользователя"})
    @ApiResponse({status: 200})
    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Post('/delete')
    delete(@Body() dto: DeleteUserDto){
        return this.userService.delete(dto);
    }

    @EventPattern('user_delete')
    deleteRmq(@Body() dto: DeleteUserDto){
        return this.userService.delete(dto);
    }
}
