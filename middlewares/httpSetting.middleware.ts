import { Injectable, type NestMiddleware } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import type { NextFunction, Request, Response } from 'express'

import { HttpReqHeader } from '@shared/core/http/interface'
import getTokenFromHeader from '@shared/utils/overWriteHeader'

@Injectable()
export class ApiSettingMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) {}

    // eslint-disable-next-line class-methods-use-this
    use(req: Request, _res: Response, next: NextFunction) {
        const token = getTokenFromHeader(req)
        // 将 Bearer Token 重新命名为 "access-token"
        req.headers[HttpReqHeader.accessToken] = token
        next()
    }
}
