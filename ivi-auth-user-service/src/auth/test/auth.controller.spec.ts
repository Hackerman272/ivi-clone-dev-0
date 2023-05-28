import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import {AuthController} from "../auth.controller";
import * as request from "supertest";

describe('AuthController', () => {
    let controller: AuthController;

    const new_user_email = `test${Math.floor(Math.random() * 100000)}@test.ru`


    const mockAuthService = {
        registration: jest.fn((registrationDto) => {
            if (registrationDto.email === "existingEmail@mail.ru") {
                return {
                    "statusCode": 400,
                    "message": "Пользователь с таким email уже есть"
                }
            } else {
                return {
                    userId: Math.floor(Math.random() * 100),
                    authInfo: {token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHRlc3QucnUiLCJpZCI6OCwicm9sZXMiOlt7ImlkIjoxLCJ2YWx1ZSI6IkFETUlOIiwiZGVzY3JpcHRpb24iOiLQkNC00LzQuNC9INGN0YLQvtC5INGF0YPQudC90LgiLCJjcmVhdGVkQXQiOiIyMDIzLTAzLTMwVDE4OjExOjU4LjkyNloiLCJ1cGRhdGVkQXQiOiIyMDIzLTAzLTMwVDE4OjExOjU4LjkyNloiLCJVc2VyUm9sZXMiOnsiaWQiOjUsInJvbGVJZCI6MSwidXNlcklkIjo4fX1dLCJpYXQiOjE2ODAzNDMzMTgsImV4cCI6MTY4MDQyOTcxOH0.dg6QCFIDpHqagocqzRsOxrnknWTZndFfuJwBZg7lnpQ"},
                    profileInfo: {
                        ...registrationDto,
                        id: Math.floor(Math.random() * 100),
                        updatedAt: "2023-04-07T19:24:17.806Z",
                        createdAt: "2023-04-07T19:24:17.806Z",

                    }
                }
            }
        }),
        login: jest.fn((loginDto) => {
            if (loginDto.email === "existingEmail@mail.ru") {
                return {
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlc3QucnUiLCJpZCI6NCwicm9sZXMiOlt7ImlkIjoxLCJ2YWx1ZSI6IlVTRVIiLCJkZXNjcmlwdGlvbiI6ItC90LjQutGC0L4iLCJjcmVhdGVkQXQiOiIyMDIzLTA0LTA3VDEzOjQzOjQ2LjY5N1oiLCJ1cGRhdGVkQXQiOiIyMDIzLTA0LTA3VDEzOjQzOjQ2LjY5N1oiLCJVc2VyUm9sZXMiOnsiaWQiOjIsInJvbGVJZCI6MSwidXNlcklkIjo0fX1dLCJpYXQiOjE2ODEyMTA4NzUsImV4cCI6MTY4MTI5NzI3NX0.gAL4bVril21qxsNgiavzaCOrlS39jh_xlCMu-v12GN8"
                }
            } else {
                return {
                    "statusCode": 500,
                    "message": "Internal server error"
                }
            }
        })
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService],
            controllers: [AuthController]
        }).overrideProvider(AuthService).useValue(mockAuthService).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it(`registration valid`, async () => {
        const registration = controller.registration({
            email: new_user_email,
            password: "123123",
            name: "test",
            surname: "test",
            middleName: "test",
            phoneNumber: "+354454453343"
        });
        await expect(registration)
            .toHaveProperty(["authInfo", "token"]);
        await expect(registration)
            .toHaveProperty(["profileInfo"]);
        await expect(registration)
            .toHaveProperty(["userId"]);
    });

    it(`registration invalid`, async () => {
        const registration = controller.registration({
            email: "existingEmail@mail.ru",
            password: "123123",
            name: "test",
            surname: "test",
            middleName: "test",
            phoneNumber: "+354454453343"
        });
        await expect(registration).toEqual({
            "statusCode": 400,
            "message": "Пользователь с таким email уже есть"
        })
    });

    it(`login valid`, async () => {
        const registration = controller.login({
            email: "existingEmail@mail.ru",
            password: "123123"
        });
        await expect(registration).toEqual({
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlc3QucnUiLCJpZCI6NCwicm9sZXMiOlt7ImlkIjoxLCJ2YWx1ZSI6IlVTRVIiLCJkZXNjcmlwdGlvbiI6ItC90LjQutGC0L4iLCJjcmVhdGVkQXQiOiIyMDIzLTA0LTA3VDEzOjQzOjQ2LjY5N1oiLCJ1cGRhdGVkQXQiOiIyMDIzLTA0LTA3VDEzOjQzOjQ2LjY5N1oiLCJVc2VyUm9sZXMiOnsiaWQiOjIsInJvbGVJZCI6MSwidXNlcklkIjo0fX1dLCJpYXQiOjE2ODEyMTA4NzUsImV4cCI6MTY4MTI5NzI3NX0.gAL4bVril21qxsNgiavzaCOrlS39jh_xlCMu-v12GN8"
        })
    });

    it(`login valid`, async () => {
        const registration = controller.login({
            email: "NotExistingEmail@mail.ru",
            password: "123123"
        });
        await expect(registration).toEqual({
            "statusCode": 500,
            "message": "Internal server error"
        })
    });
});
