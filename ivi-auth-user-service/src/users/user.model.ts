import {Model, Table, Column, BelongsToMany, HasMany} from "sequelize-typescript"
import {DataTypes} from "sequelize";
import {ApiProperty} from "@nestjs/swagger";
import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-roles.model";

interface UserCreationAttrs {
    email: string;
    password: string;
    profileId: number;
    vk_id: number;
    vk_access_token: string;
    google_access_token: string;
}

@Table({tableName: "users"})
export class User extends Model<User, UserCreationAttrs> {
    @ApiProperty({example: '1', description: "Уникальный id"})
    @Column({type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 'test@test.com', description: "Уникальный адрес почты"})
    @Column({type: DataTypes.STRING, unique: true, allowNull: false})
    email: string;

    @ApiProperty({example: '654321', description: "Пароль пользователя"})
    @Column({type: DataTypes.STRING, allowNull: false})
    password: string;

    @ApiProperty({example: 'true', description: "Юзер забанен или нет"})
    @Column({type: DataTypes.BOOLEAN, defaultValue: false})
    banned: boolean;

    @ApiProperty({example: 'Хакерская активность', description: "Причина бана, при наличии"})
    @Column({type: DataTypes.STRING, allowNull: true})
    banReason: string;

    @BelongsToMany(() => Role, () => UserRoles)
    roles: Role[]

    @Column({type: DataTypes.INTEGER, unique: true, autoIncrement: false, allowNull: true})
    profileId: number;

    @Column({type: DataTypes.INTEGER, unique: true, autoIncrement: false, allowNull: true})
    vk_id: number;

    @Column({type: DataTypes.STRING, allowNull: true})
    vk_access_token: string;

    @Column({type: DataTypes.STRING, allowNull: true})
    google_access_token: string;
}
