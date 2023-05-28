import { HttpStatus } from "@nestjs/common";

import * as jwt from "jsonwebtoken";
import * as request from "supertest";

describe("AuthController (e2e)", () => {
    const authUrl = `http://localhost:7001/auth`;
    const rolesUrl = `http://localhost:7001/roles`;
    const profileUrl = `http://localhost:7000/profile`;
    const new_user_email = `test${Math.floor(Math.random() * 100000)}@test.ru`
    let jwtoken = "";
    let newProfileId: number | null;
    const userProfileData = {
            "email": new_user_email,
            "password": "123123",
            "name": "testUserName",
            "surname": "testUserSurname",
            "phoneNumber": "8 800 555 35 35"
    }

    const loginData = {
        "email": new_user_email,
        "password": "123123"
    }

    describe("/auth/register (POST)", () => {
        it("it should register a user and return the new user object", () => {
            return request(authUrl)
                .post("/registration")
                .set("Accept", "application/json")
                .send(userProfileData)
                .expect((response: request.Response) => {
                    const {
                        userId,
                        authInfo,
                        profileInfo,
                    } = response.body;
                    jwtoken = response.body.authInfo.token
                    newProfileId = response.body.profileInfo.id
                    expect(typeof userId).toBe("number")
                    expect(authInfo).toHaveProperty("token")
                    expect(typeof profileInfo.id).toBe("number")
                    expect(profileInfo.name).toEqual(userProfileData.name)
                    expect(profileInfo.surname).toEqual(userProfileData.surname)
                    expect(profileInfo.phoneNumber).toEqual(userProfileData.phoneNumber)
                })
                .expect(HttpStatus.CREATED);
        });

        it("check if login works properly for new user", () => {
            return request(authUrl)
                .post("/login")
                .set("Accept", "application/json")
                .send(loginData)
                .expect((response: request.Response) => {
                    const {
                        token
                    } = response.body;
                    expect(token.slice(0, 30)).toEqual(jwtoken.slice(0, 30))
                })
                .expect(HttpStatus.CREATED);
        });

        it("check if token works", () => {
            return request(rolesUrl)
                .get("/USER")
                .set("Authorization", `Bearer ${jwtoken}`)
                .expect(HttpStatus.OK);
        });

        it("check if data passed by RMQ properly", () => {
            return request(profileUrl).get("/")
                .expect((response: request.Response) => {
                    const profileData = response.body.find(profileData => profileData.id === newProfileId)
                    expect(profileData.name).toEqual(userProfileData.name)
                    expect(profileData.surname).toEqual(userProfileData.surname)
                    expect(profileData.phoneNumber).toEqual(userProfileData.phoneNumber)
                })
        })


        it("it should not register a user and return the new user object due to email duplication", () => {
            return request(authUrl)
                .post("/registration")
                .set("Accept", "application/json")
                .send(userProfileData)
                .expect((response: request.Response) => {
                    const {
                        statusCode,
                        message
                    } = response.body;

                        expect(statusCode).toEqual(400)
                        expect(message).toEqual("Пользователь с таким email уже есть")
                })
                .expect(HttpStatus.BAD_REQUEST);
        });
    });
});
