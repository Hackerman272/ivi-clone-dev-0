import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
    UnprocessableEntityException,
    UsePipes
} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {AuthService} from "./auth.service";
import {RegistrationDto} from "./dto/registration.dto";
import {EventPattern} from "@nestjs/microservices";
import {LoginDto} from "./dto/login.dto";
import {ValidationPipe} from "../pipes/validation.pipe";
import {HttpStatusCode} from "axios";
import {AuthVKGoogleCode} from "./auth.model";
import {UsersService} from "../users/users.service";
import {VKUserDto} from "../users/dto/vk-user.dto";
import {User} from "../users/user.model";
import {v4 as uuidv4} from "uuid";


@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,
                private userService: UsersService) {
    }
    @UsePipes(ValidationPipe)
    @Post('/login')
    login(@Body()  loginDto: LoginDto){
        return this.authService.login(loginDto)
    }


    @UsePipes(ValidationPipe)
    @Post('/registration')
    registration(@Body()  registrationDto: RegistrationDto){
        return this.authService.registration(registrationDto)
    }

    @Post("/registration/google")
    async registrationGoogle(@Body(new ValidationPipe()) auth: AuthVKGoogleCode) {
        let authData;

        try {
            authData = await this.authService.getGoogleToken(auth.code);
        } catch (err) {
            console.log(err)
            throw new HttpException("Wrong Google code", HttpStatusCode.Unauthorized);
        }

        console.log("authData.data")
        console.log(authData.data)
        const dataUserGoogle: any = await this.authService.getUserDataFromGoogle(
            authData.data.access_token
        );

        console.log("data.response")
        console.log(dataUserGoogle)
        const _user = await this.userService.findByEmail(dataUserGoogle.email);

        console.log("_user")
        console.log(_user)
        if (_user) {
            return await this.authService.login({vk_id: null, email: dataUserGoogle.email,
                password: uuidv4()}, true);
        }

        try {
            return await this.authService.registration({
                vk_id: null,
                email: dataUserGoogle.email,
                password: uuidv4(),
                name: dataUserGoogle.given_name,
                surname: dataUserGoogle.family_name,
                middleName: null,
                phoneNumber: null,
                vk_access_token: null,
                google_access_token: authData.data.access_token
            });
        } catch (err) {
            console.log(err)
            throw new UnprocessableEntityException(err);
        }
    }

    @Post("/registration/vk")
    async registrationVK(@Body(new ValidationPipe()) auth: AuthVKGoogleCode) {
        let authData;

        try {
            authData = await this.authService.getVkToken(auth.code);
        } catch (err) {
            console.log(err)
            throw new HttpException("Wrong VK code", HttpStatusCode.Unauthorized);
        }

        const hasEmail = authData.data.hasOwnProperty("email");

        console.log("authData.data")
        console.log(authData.data)
        const _user = hasEmail
            ? await this.userService.findByEmail(authData.data.email)
            : await this.userService.findByVkId(authData.data.user_id);

        console.log("_user")
        console.log(_user)
        if (_user) {
            return await this.authService.login({vk_id: _user.vk_id, email: `nomail@mail.ru`,
                password: uuidv4()}, true);
        }

        try {
            const dataUserVk: any = await this.authService.getUserDataFromVk(
                authData.data.user_id,
                authData.data.access_token
            );

            console.log("data.response")
            console.log(dataUserVk.data.response[0])


            return await this.authService.registration({
                vk_id: authData.data.user_id,
                email: authData.data.email? authData.data.email: `nomail${uuidv4()}@mail.ru`,
                password: uuidv4(),
                name: dataUserVk.data.response[0].first_name,
                surname: dataUserVk.data.response[0].last_name,
                middleName: null,
                phoneNumber: null,
                vk_access_token: authData.data.access_token,
                google_access_token: null
            });
        } catch (err) {
            console.log(err)
            throw new UnprocessableEntityException(err);
        }
    }
}
