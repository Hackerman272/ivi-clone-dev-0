import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {Profile} from "./profile.model";
import {CreateProfileDto} from "./dto/create-profile.dto";
import {DeleteProfileDto} from "./dto/delete-profile.dto";
import {EditProfileDto} from "./dto/edit-profile.dto";
import {ClientProxy} from "@nestjs/microservices";
import {firstValueFrom} from "rxjs";

// делаем внедряемым в другие сервисы с помощью Injectable
@Injectable()
export class ProfileService {
    constructor(@InjectModel(Profile) private profileRepository: typeof Profile,
                @Inject('USER_AUTH_SERVICE') private readonly userAuthClient: ClientProxy) {
        this.userAuthClient.connect().then(result => console.log(result)).catch(error => console.log(error));
    }
    // dto позволяет управляет передаваемыми данными в сервис, в т.ч. их валидировать.
    async createProfile(dto: any) {
        // const profileData = JSON.parse(dto.toString())
        console.log(dto)
        const profile = await this.profileRepository.create({...dto}); // добавляем к полям с dto ещё поле
        return profile
    }

    async getProfileRmq(profileId) {
        const profile = await this.profileRepository.findByPk(profileId);
        if (!profile) {
            throw new HttpException('Профиля не существует', HttpStatus.NOT_FOUND)
        }
        return profile
    }

    async deleteProfile(dto: DeleteProfileDto) {
        const profile = await this.profileRepository.findByPk(dto.profileId);
        if (!profile) {
            throw new HttpException('Профиля не существует', HttpStatus.NOT_FOUND)
        }

        // надо удалять или банить пользователя при удалении профиля? Если просто банить, адрес почты блокируется для повторного использования.
        // Вариант для бана.
        // await firstValueFrom(
        //     this.userAuthClient.send('user_ban', {profileId: dto.profileId,
        //         banReason: "Профиль пользователя удалён"}),
        // );


        // Вариант для удаления
        await firstValueFrom(
            this.userAuthClient.send('user_delete', {profileId: dto.profileId}),
        );

        await this.profileRepository.destroy({where: {id: dto.profileId}}); // удаляем профиль
    }

    async editProfile(dto: EditProfileDto) {
        const profile = await this.profileRepository.findByPk(dto.profileId);
        if (!profile) {
            throw new HttpException('Профиля не существует', HttpStatus.NOT_FOUND)
        }
        await this.profileRepository.update({...dto}, {where: {id: dto.profileId}});
    }


    async getAllProfiles() {
        const profiles = await this.profileRepository.findAll({include: {all: true}})
        return profiles;
    }
}
