import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";
import {JwtService} from "@nestjs/jwt";

// разграничение доступов к эндпоинтам
// Injectable для возможности использования в контроллере
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor( private jwtService: JwtService) {
    }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            // берём токен из хедеров, чтобы по нему затем провести проверку прав
            const request = context.switchToHttp().getRequest()
            const authHeader = request.headers.authorization;
            const bearer_title = authHeader.split(' ')[0]
            const token = authHeader.split(' ')[1]

            if (bearer_title !== 'Bearer' || !token) {
                throw new UnauthorizedException({message: "Пользователь не авторизован"})
            }

            const user = this.jwtService.verify(token);
            request.user = user;
            return true;

        } catch (error) {
            throw new UnauthorizedException({message: "Пользователь не авторизован"})
        }
    }
}
