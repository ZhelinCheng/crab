/**
 * Created by ChengZheLin on 2019/8/9.
 * Features:
 */

import { Context, Middleware } from 'koa'

interface Msg {
    [key: string]: string
}

const _MSG: Msg = {
    200: '请求成功',
    401: '请登录',
    403001: '权限不足',
    403002: '传递参数不符合规范',
    403003: '该用户已存在',
    403004: '账号或密码错误'
}

export default function (ops?: object): Middleware {
    return function (ctx: Context, next: Function) {
        if (ctx.render) return next()

        ctx.render = function (code: number = 200, data: any = null, dm?: string) {
            code < 1000 && (ctx.status = code)
            ctx.body = {
                code,
                msg: dm ? dm : _MSG[code],
                data
            }
        }

        return next()
    }
}
