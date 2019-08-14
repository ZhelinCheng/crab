/**
 * Created by ChengZheLin on 2019/8/9.
 * Features:
 */

import jwt from 'jwt-simple'
import { Context } from 'koa'
import bcrypt from 'bcryptjs'
import Users, { UserItem } from '../models/Users'

const {secret} = require('../../crab.config')

export default class AllowedMethods {
    static async login(ctx: Context, next: Function) {
        const body = ctx.request.body
        const name = body.name
        const password = body.password
        const expires = Date.now() + 1000 * 10080

        if (/^\w{5,16}$/.test(name) && password.length <= 16) {
            let userArray = await Users.select({
                name
            })

            const user: UserItem = userArray[0]
            if (user && bcrypt.compareSync(password, user.hash)) {
                const payload = {
                    iss: 'crab',
                    exp: expires,
                    admin: user.admin,
                    execute: user.execute,
                    uid: user.uid,
                    name
                }
                const Token = jwt.encode(payload, secret)
                ctx.render(200, Token)
            } else {
                ctx.render(403004)
            }
            return
        }

        ctx.render(403002)
        await next()
    }


    static async allowed(ctx: Context, next: Function) {
        let token: string = ctx.get('authorization')
        if (/^bearer/i.test(token)) {
            try {
                token = token.replace(/^bearer\s+/i, '')
                const payload = jwt.decode(token, secret)
                if (Date.now() > payload.exp) {
                    ctx.render(401, null, 'Token已过期')
                } else {
                    ctx.state.user = payload
                }
            } catch (e) {
                ctx.render(401, null, '无效Token')
            }
        } else {
            ctx.render(401, null, '请登录')
        }

        await next()
    }

    static wsAllowed(token: string = '') {
        if (token) {
            try {
                token = token.replace(/^bearer\s+/i, '')
                const payload = jwt.decode(token, secret)
                if (Date.now() <= payload.exp) {
                    return payload
                }
            } catch (e) {
                return false
            }
        }
        return false
    }

    static payload(ctx: Context): any {
        let token: string = ctx.get('authorization')
        if (/^bearer/i.test(token)) {
            try {
                token = token.replace(/^bearer\s+/i, '')
                const payload = jwt.decode(token, secret)
                if (Date.now() > payload.exp) {
                    return false
                } else {
                    return payload
                }
            } catch (e) {
                return false
            }
        }

        return false
    }
}
