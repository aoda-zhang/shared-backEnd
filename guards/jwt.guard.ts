import {
    BadRequestException,
    type CanActivate,
    type ExecutionContext,
    Injectable
} from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import type { Reflector } from '@nestjs/core'
import type { JwtService } from '@nestjs/jwt'

import { LocaleKeys } from '@shared/constant/enum'
import {
    HttpBusinessCode,
    HttpBusinessMappingCode,
    HttpReqHeader
} from '@shared/core/http/interface'
import Decorators from '@shared/decorators/decorators.enum'
import trime from '@shared/utils/trime'

@Injectable()
export default class JWTGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private configService: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const response = context.switchToHttp().getResponse()
        const token = context.switchToHttp()?.getRequest<Request>()?.headers?.[
            HttpReqHeader.accessToken
        ]
        const locale = context.switchToHttp()?.getRequest<Request>()?.headers?.[
            HttpReqHeader.locale
        ]
        const isNoTokenReq = this.reflector.getAllAndOverride<boolean>(Decorators.noToken, [
            context.getHandler(),
            context.getClass()
        ])

        // Set Local information to req
        request.locale = locale ?? LocaleKeys.zh_CN
        try {
            if (isNoTokenReq) {
                return true
            }
            if (token) {
                const userInfo = await this.jwtService.verifyAsync(token, {
                    secret: this.configService.get('auth.secret')
                })
                if (userInfo) {
                    // 用户信息，可以直接在request中的user获取
                    request.user = userInfo
                    return true
                }
                throw new BadRequestException('用户信息不存在')
            }
            return false
        } catch (error) {
            switch (trime(error?.message)) {
                // 根据不同的错误情况，设置特定的业务code，方便前端做对应处理
                case HttpBusinessCode.jwtexpired || HttpBusinessCode.invalidToken:
                    response.data = HttpBusinessMappingCode.jwtexpired
                    break
                default:
                    break
            }
            throw new BadRequestException(`error:${error}`)
        }
    }
}
