/**
 * Created by ChengZheLin on 2019/8/9.
 * Features:
 */

import jwt from 'jwt-simple'
import { Context } from 'koa'
const { secret } = require('../../crab.config')

export default class AllowedMethods {
    static async login (ctx: Context) {
        const body = ctx.request.body;
        const name = body.name;
        const password = body.password;
        const expires = Date.now() + 1000 * 60;

        const payload = {
            iss: 'crab',
            exp: expires,
            admin: true,
            jti: Math.random(),
            name
        };
        const Token = jwt.encode(payload, secret);
        ctx.body = {
            code: 200,
            msg: '登陆成功',
            data: Token,
        }
    }


    static async allowed (ctx: Context, next: Function) {
        let token: string = ctx.get('authorization')
        ctx.status = 401

        if (/^bearer/i.test(token)) {
            try {
                token = token.replace(/^bearer\s+/i, '')
                const payload = jwt.decode(token, secret)
                if (Date.now() >  payload.exp) {
                    ctx.body = {
                        code: 401,
                        msg: 'Token已过期，请重新登录'
                    }
                } else {
                    ctx.status = 200
                    next()
                }
            } catch (e) {
                ctx.body = {
                    code: 401,
                    msg: 'Token无效'
                }
            }
        } else {
            ctx.body = {
                code: 401,
                msg: '未登录'
            }
        }
    }
}
