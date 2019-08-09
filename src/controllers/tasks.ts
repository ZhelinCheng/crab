/**
 * Created by ChengZheLin on 2019/8/9.
 * Features:
 */
import { Context } from 'koa'

export async function getTasksList (ctx: Context, next: Function): Promise<void> {
    try {
        ctx.render(200, 111)
    } catch (e) {
        next(e)
    }
}
