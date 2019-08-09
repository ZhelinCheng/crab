/**
 * Created by ChengZheLin on 2019/8/9.
 * Features:
 */

import { Context } from 'koa'
import Users from '../models/Users'
import bcrypt from 'bcryptjs'
import allowedMethods from '../middleware/allowedMethods'

/**
 * 注册
 * @param ctx
 * @param next
 */
export async function registered(ctx: Context, next: Function) {
    try {
        const user = allowedMethods.payload(ctx)
        const count = await Users.count()

        // 如果用户表为空，则创建一个管理账户
        if ((user && user.admin) || !count) {
            const body = ctx.request.body || {}
            const name = body.name
            const password = body.password
            const execute = body.execute
            // 账号密码校验
            if (/^\w{5,16}$/.test(name) && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/.test(password)) {
                let dbUser = await Users.select({
                    name
                })

                // 判断用户是否存在
                if (dbUser.length <= 0) {
                    const salt = bcrypt.genSaltSync(8)
                    const hash = bcrypt.hashSync(password, salt)
                    await Users.registered({
                        name,
                        hash,
                        admin: count <= 0 ? 1 : 0,
                        nickname: name,
                        execute: count <= 0 ? 1 : (execute ? 1 : 0)
                    })
                    ctx.render(200, null, '注册成功，请登录！')
                    return
                }
                ctx.render(403003)
            } else {
                ctx.render(403002)
            }
        } else {
            ctx.render(403001)
        }
    } catch (e) {
        next(e)
    }
}

/**
 * 重置密码
 * @param ctx
 * @param next
 */
export async function reset(ctx: Context, next: Function) {
    try {
    } catch (e) {
        next(e)
    }
}
