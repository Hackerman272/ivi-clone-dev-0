import {
    BadRequestException,
    Body,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    Post,
    UnauthorizedException
} from '@nestjs/common';
import { HttpService } from "@nestjs/axios";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from "bcryptjs"
import {User} from "../users/user.model";
import * as process from "process";
import {firstValueFrom} from "rxjs";
import {ClientProxy} from "@nestjs/microservices";
import {RolesService} from "../roles/roles.service";
import {RegistrationDto} from "./dto/registration.dto";
import {LoginDto} from "./dto/login.dto";
import {InjectModel} from "@nestjs/sequelize";
import {UserRoles} from "../roles/user-roles.model";

@Injectable()
export class AuthService {
    constructor(private userService: UsersService,
                private jwtService: JwtService,
                @Inject('PROFILE_SERVICE') readonly profileClient: ClientProxy,
                @InjectModel(UserRoles) private userRolesRepository: typeof UserRoles,
                private roleService: RolesService,
                private http: HttpService) {
        this.profileClient.connect().then(result => console.log(result)).catch(error => console.log(error));
    }

    async login(loginDto: LoginDto, skipPasswordCheck: boolean = false){
        let user;
        if (skipPasswordCheck) {
            user = await this.userService.findByVkId(loginDto.vk_id)
        } else {
            user = await this.validateUser(loginDto)
        }

        const roles = await this.userRolesRepository.findAll({where: {"userId": user.id}})
        user.roles = []
        for (let role of roles) {
            const roleData = await this.roleService.getRoleById(role.roleId)
            user.roles.push(roleData)
        }
        const token = (await this.generateToken(user)).token

        let rolesData = []
        for (let role of roles) {
            const roleData = await this.roleService.getRoleById(role.roleId)
            rolesData.push(roleData.value)
        }
        return {
            id: user.id,
            banned: user.banned,
            email: user.email,
            roles: rolesData,
            token: token
        }
    }


    async registration(registrationDto: RegistrationDto){
        console.log(1)
        const candidate = await this.userService.getUserByEmail(registrationDto.email)
        console.log(2)
        if (candidate) {
            throw new HttpException('Пользователь с таким email уже есть', HttpStatus.BAD_REQUEST)
        }
        console.log(3)
        console.log(registrationDto)
        const createProfileResponse = await firstValueFrom(
            this.profileClient.send('profile_create', {...registrationDto}),
        );
        console.log(4)
        console.log(createProfileResponse)
        const hashPassword = await bcrypt.hash(registrationDto.password, 5);
        const user = await this.userService.createUser({...registrationDto,
            password: hashPassword,
            profileId: createProfileResponse.id
        })
        return {
                id: user.id,
                email: user.email,
                banned: user.banned,
                roles: user.roles.map(role => role.value),
                token: (await this.generateToken(user)).token,
                name: createProfileResponse.name,
                phoneNumber: createProfileResponse.phoneNumber,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt,
        }
    }

    private async generateToken(user: User) {
        const payload = {email: user.email, id: user.id, roles: user.roles}
        return {
            token: this.jwtService.sign(payload)
        }
    }

    async getVkToken(code: string): Promise<any> {
        const VKDATA = {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
        };

        const host =
            process.env.NODE_ENV === "prod"
                ? process.env.APP_HOST
                : process.env.APP_LOCAL;
        console.log(`https://oauth.vk.com/access_token?client_id=${VKDATA.client_id}&client_secret=${VKDATA.client_secret}&redirect_uri=${host}/&code=${code}`)
        return await this.http
            .get(
                `https://oauth.vk.com/access_token?client_id=${VKDATA.client_id}&client_secret=${VKDATA.client_secret}&redirect_uri=${host}/&code=${code}`
            )
            .toPromise();
    }

    async getUserDataFromVk(userId: string, token: string): Promise<any> {
        console.log(`https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_400,has_mobile,home_town,contacts,mobile_phone&access_token=${token}&v=5.120`)
        return this.http
            .get(
                `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_400,has_mobile,home_town,contacts,mobile_phone&access_token=${token}&v=5.120`
            )
            .toPromise();
    }

    private async validateUser(loginDto: LoginDto) {
        const user = await this.userService.getUserByEmail(loginDto.email);
        if (!user) {
            throw new HttpException('Такого пользователя нет', HttpStatus.BAD_REQUEST)
        }
        const passwordEquals = await bcrypt.compare(loginDto.password, user.password);
        if (user && passwordEquals) {
            return user;
        }
        // для проверки корректности/наличия email нужна дополнительная проверка, данной недостаточно.
        throw new UnauthorizedException({message: 'Некорректный пароль'})
    }
}
