import {Model, Table, Column, ForeignKey} from "sequelize-typescript"
import {DataTypes} from "sequelize";
import {ApiProperty} from "@nestjs/swagger";
import {User} from "../users/user.model";
import {Role} from "./roles.model";

@Table({tableName: "UserRoles", createdAt: false, updatedAt: false})
export class UserRoles extends Model<UserRoles> {
    @ApiProperty({example: '1', description: "Уникальный id"})
    @Column({type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ForeignKey(() => Role)
    @Column({type: DataTypes.INTEGER})
    roleId: number;

    @ForeignKey(() => User)
    @Column({type: DataTypes.INTEGER})
    userId: number;
}
