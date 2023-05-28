import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CreateRoleDto} from "./dto/create-role.dto";
import {InjectModel} from "@nestjs/sequelize";
import {Role} from "./roles.model";

@Injectable()
export class RolesService {

    constructor(@InjectModel(Role) private roleRepository: typeof Role) {
    }
    async createRole(dto: CreateRoleDto){
        const existingRole = await this.roleRepository.findOne({where:
                {value: dto.value}})
        if (existingRole) throw new HttpException('Роль с таким value уже есть', HttpStatus.BAD_REQUEST)
        const role = await this.roleRepository.create(dto)
        return role;
    }

    async getRoleByValue(value: string) {
        const role = await this.roleRepository.findOne({where: {value}})
        return role;
    }

    async getRoleById(id: number) {
        const role = await this.roleRepository.findByPk(id)
        return role;
    }
}
