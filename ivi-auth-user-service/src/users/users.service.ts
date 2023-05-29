import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {User} from "./user.model";
import {CreateUserDto} from "./dto/create-user.dto";
import {RolesService} from "../roles/roles.service";
import {AddRoleDto} from "./dto/add-role.dto";
import {BanUserDto} from "./dto/ban-user.dto";
import {firstValueFrom} from "rxjs";
import {DeleteUserDto} from "./dto/delete-user.dto";
import {ClientProxy} from "@nestjs/microservices";
import {UserRoles} from "../roles/user-roles.model";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User,
                @InjectModel(UserRoles) private userRolesRepository: typeof UserRoles,
                private roleService: RolesService,
                @Inject('PROFILE_SERVICE') readonly profileClient: ClientProxy) {
        this.profileClient.connect().then(result => console.log(result)).catch(error => console.log(error));
    }

    async findByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: {
                email,
            },
        });
        if (!user) {
            return null
        }



        return {
            id: user.id,
            banned: user.banned,
            email: user.email,
            roles: user.roles,
            vk_id: user.vk_id,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt,
        }
    }

    async findByVkId(vk_id: number) {
        const user: User = await this.userRepository.findOne({
            where: {
                vk_id,
            },
        });
        if (!user) {
            return null
        }


        return {
            id: user.id,
            banned: user.banned,
            email: user.email,
            roles: user.roles,
            vk_id: user.vk_id,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt,
        }
    }


    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto);
        // дефолтная роль пользователя
        const role = await this.roleService.getRoleByValue("USER")
        console.log(role)
        await user.$set('roles', [role.id])
        user.roles = [role]
        return user;
    }

    async getAllUsers() {
        const users = await this.userRepository.findAll({include: {all: true}})
        return users;
    }

    async getMe(userId) {
        const user = await this.userRepository.findByPk(userId)
        const profileId = user.profileId
        const myProfileResponse = await firstValueFrom(
            await this.profileClient.send('get_profile', profileId),
        ).catch(error => console.log(error));

        const roles = await this.userRolesRepository.findAll({where: {"userId": userId}})
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
            name: myProfileResponse.name,
            phoneNumber: myProfileResponse.phoneNumber,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt,
        }
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({where: {email}, include: {all: true}})
        return user
    }

    async addRole(dto: AddRoleDto){
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);
        if (role && user) {
            await user.$add('role', role.id);
            return dto;
        }
        throw new HttpException('Пользователь или роль не найдены...', HttpStatus.NOT_FOUND);
    }

    async ban(dto: BanUserDto) {
        let user;
        if (dto.profileId) {
            user = await this.userRepository.findOne({where: {profileId: dto.profileId}});
        } else {
            user = await this.userRepository.findByPk(dto.userId);
        }
        if (!user) {
            throw new HttpException('Пользователь не существует', HttpStatus.NOT_FOUND)
        }
        user.banned = true;
        user.banReason = dto.banReason;
        user.profileId = null;
        await user.save();

        delete user.password

        return user;
    }

    async delete(dto: DeleteUserDto) {
        if (dto.profileId) {
            await this.userRepository.destroy({where: {profileId: dto.profileId}}); // удаляем профиль
        } else {
            await this.userRepository.destroy({where: {id: dto.userId}}); // удаляем профиль
        }
        return {
            "message": `Пользователь удалён`
        };
    }
}
