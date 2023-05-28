import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import {Observable} from "rxjs";
import {JwtService} from "@nestjs/jwt";
import {Reflector} from "@nestjs/core";
import {ROLES_KEY} from "./roles-auth.decorator";

// разграничение доступов к эндпоинтам
// Injectable для возможности использования в контроллере
@Injectable()
export class RolesGuard implements CanActivate {
    constructor( private jwtService: JwtService,
                 private reflector: Reflector) {
    }
    async canActivate(context: ExecutionContext) {
        try {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        if (!requiredRoles) { // если @Roles("ADMIN") не заданы
            return true;
        }

        // берём токен из хедеров, чтобы по нему затем провести проверку прав
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers.authorization;
        const bearer_title = authHeader.split(' ')[0]
        const token = authHeader.split(' ')[1]

        if (bearer_title !== 'Bearer' || !token) {
            throw new UnauthorizedException({message: "Пользователь не авторизован"})
        }

        const user = await this.jwtService.verify(token);

        request.user = user;
        // + проверка того, что профиль принадлежит автору запроса
        // !!! уязвимость, можно подставить для любого несвязанного запроса profileId совпадающий со своим токеном
            // и получить доступ к любому эндпоинту. Необходимо разрганичить (разные декораторы?)
        // if (request.body.profileId) {
        //     const userId = await this.profileService.getUserIdByProfileId(request.body.profileId)
        //     if (userId === user.id) {
        //         return true; // если своё, то не надо обращаться к ролям
        //     }
        // }
        return user.roles.some(role => requiredRoles.includes(role.value));
    } catch(error) {
            console.log(error)
            throw new HttpException("нет доступа", HttpStatus.FORBIDDEN)
        }
    }
}
