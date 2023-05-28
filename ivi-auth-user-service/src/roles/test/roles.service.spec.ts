import {HttpException, HttpStatus} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../roles.service';
import {Role} from "../roles.model";
import {getModelToken} from "@nestjs/sequelize";
import * as request from "supertest";
import {errorContext} from "rxjs/internal/util/errorContext";
import {response} from "express";

describe('rolesService', () => {
    let rolesService: RolesService;

    const mockSequelizeRoles = {
        create: jest.fn().mockImplementation(dto =>
            {
                    if (dto.value === "EXISTING_ROLE") {
                        return new HttpException('Роль с таким value уже есть', HttpStatus.BAD_REQUEST)
                    } else {
                        return {
                            id: Math.floor(Math.random() * 100),
                            ...dto
                        }
                    }
        }),
        findOne: jest.fn().mockImplementation((searchPattern = {}) =>  {
            console.log(searchPattern)
            if (searchPattern.where?.value === "NOROLE") {
                return ({});
            } else if (searchPattern.where?.value === "EXISTING_ROLE") {
                return ({
                    "id": Math.floor(Math.random() * 100),
                    "value": "EXISTING_ROLE",
                    "description": "test",
                    "createdAt": "2023-04-07T13:43:46.697Z",
                    "updatedAt": "2023-04-07T13:43:46.697Z"
                })
            }
        })
    };

    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            providers: [RolesService, {
                provide: getModelToken(Role),
                useValue: mockSequelizeRoles
            }],
        }).compile();

        rolesService = module.get<RolesService>(RolesService);
    });

    it('should be defined', () => {
        expect(rolesService).toBeDefined();
    });

    it('should create new role', async () => {
        expect(await rolesService.createRole({
            "value": "TEST",
            "description": "test"
        })).toEqual({
            id: expect.any(Number),
            value: "TEST",
            description: "test"
        });
    })


    it('should not create new role', async () => {
         await rolesService.createRole({
            "value": "EXISTING_ROLE",
            "description": "тестовая роль"
        }).catch(errorContext => {
            expect(errorContext.status).toEqual(400)
            expect(errorContext.response).toEqual('Роль с таким value уже есть')
         })
    })

    it('should get role', async () => {
        expect(await rolesService.getRoleByValue("EXISTING_ROLE")).toEqual({
            id: expect.any(Number),
            value: "EXISTING_ROLE",
            description: "test",
            createdAt: "2023-04-07T13:43:46.697Z",
            updatedAt: "2023-04-07T13:43:46.697Z"
        });
    })

    it('should get nothing', async () => {
        expect(await rolesService.getRoleByValue("NOROLE")).toEqual({});
    })
});

