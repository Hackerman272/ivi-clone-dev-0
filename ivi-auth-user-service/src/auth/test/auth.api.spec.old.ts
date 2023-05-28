import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AuthModule } from "../auth.module";
import { AuthService } from '../auth.service';
import {forwardRef, INestApplication} from '@nestjs/common';
import {RolesModule} from "../../roles/roles.module";
import {UsersModule} from "../../users/users.module";
import {SequelizeModule} from "@nestjs/sequelize";
import {ConfigModule} from "@nestjs/config";
import * as process from "process";
import {JwtModule} from "@nestjs/jwt";
import {Role} from "../../roles/roles.model";
import {User} from "../../users/user.model";
import {UserRoles} from "../../roles/user-roles.model";
import {RolesService} from "../../roles/roles.service";


describe('Auth', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                forwardRef( () => RolesModule),
                forwardRef( () => UsersModule),
                forwardRef(() => AuthModule)
        ],
        })
            .overrideProvider(AuthService)
            .useValue(AuthService)
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    const new_user_email = `test${Math.floor(Math.random() * 100000)}@test.ru`
    it(`/POST auth/registration valid`, () => {
        const isValidOrg = function(res) {
            res.body.should.have.property("userId", "authInfo", "profileInfo");
            res.body.authInfo.should.have.property("token")
            res.body.profileInfo.should.have.property("id", "name", "surname", "phoneNumber", "middleName")
        };

        return request(app.getHttpServer())
            .post('/auth/registration')
            .send({
                "email": new_user_email,
                "password": "123123",
                "name": "test",
                "surname": "test",
                "phoneNumber": "+354454453343"
            })
            .expect(201)
            .expect(isValidOrg);
    });
    it(`/POST auth/registration invalid`, () => {

        return request(app.getHttpServer())
            .post('/auth/registration')
            .send({
                "email": new_user_email,
                "password": "123123",
                "name": "test",
                "surname": "test",
                "phoneNumber": "+354454453343"
            })
            .expect(400)
            .expect({
                "statusCode": 400,
                "message": "Пользователь с таким email уже есть"
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
