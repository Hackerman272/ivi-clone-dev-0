import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import {AuthController} from "../auth.controller";

describe('AuthService', () => {
    let service: AuthService;

    const mockAuthService = {}

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService]
        }).overrideProvider(AuthService).useValue(mockAuthService).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
