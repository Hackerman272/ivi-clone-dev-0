import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../roles.service';
import { RolesController } from '../roles.controller';
import {RolesGuard} from "../../auth/roles.guard";
import {Reflector} from "@nestjs/core";
import {JwtService} from "@nestjs/jwt";

describe('RolesController', () => {
    let guard: RolesGuard;
    let reflector: Reflector;
    let controller: RolesController;

    const mockRolesService = {
        createRole: jest.fn((dto) => {
            return {
                id: Math.floor(Math.random() * 100),
                ...dto
            }
        }),
        getRoleByValue: jest.fn((value: string) => {
            if (value === "NOROLE") {
                return {};
            } else if (value === "TEST") {
                return {
                    "id": Math.floor(Math.random() * 100),
                    "value": "TEST",
                    "description": "test",
                    "createdAt": "2023-04-07T13:43:46.697Z",
                    "updatedAt": "2023-04-07T13:43:46.697Z"
                }
            }
        })
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RolesService, RolesGuard, JwtService,
                {
                    provide: Reflector,
                    useValue: {
                        constructor: jest.fn(),
                        get: jest.fn(),
                    },
                },
            ],
            controllers: [RolesController]
        }).overrideProvider(RolesService).useValue(mockRolesService).compile();

        controller = module.get<RolesController>(RolesController);
        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    it('RolesController - should be defined', () => {
        expect(controller).toBeDefined();
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    describe('roles', () => {
        it('no role', async () => {
            const getRole = controller.getByValue("NOROLE");
            await expect(getRole).toEqual({});
        });

        it('create role', () => {
            expect(controller.create({
                "value": "TEST",
                "description": "тестовая роль"
            })).toEqual({
                id: expect.any(Number),
                value: "TEST",
                description: "тестовая роль"
            });
        });

        it('existing role', async () => {
            const getRole = controller.getByValue("TEST");
            await expect(getRole).toEqual({
                id: expect.any(Number),
                value: "TEST",
                description: "test",
                createdAt: "2023-04-07T13:43:46.697Z",
                updatedAt: "2023-04-07T13:43:46.697Z"
            });
        });
    });
});
