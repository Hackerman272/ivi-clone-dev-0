import {Model, Table, Column} from "sequelize-typescript"
import {DataTypes} from "sequelize";
import {ApiProperty} from "@nestjs/swagger";

interface ProfileCreationAttrs {
    name: string;
    surname: string;
    middleName: string;
    phoneNumber: string;
}

@Table({tableName: "profiles"})
export class Profile extends Model<Profile, ProfileCreationAttrs> {
    @ApiProperty({example: '1', description: "Уникальный id"})
    @Column({type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 'Василий', description: "Имя"})
    @Column({type: DataTypes.STRING, allowNull: false})
    name: string;

    @ApiProperty({example: 'Васильев', description: "Фамилия"})
    @Column({type: DataTypes.STRING, allowNull: true})
    surname: string;

    @ApiProperty({example: 'Васильевич', description: "Имя"})
    @Column({type: DataTypes.STRING, allowNull: true})
    middleName: string;

    @ApiProperty({example: '8-800-555-35-35', description: "Номер телефона"})
    @Column({type: DataTypes.STRING, allowNull: true})
    phoneNumber: string;
}
