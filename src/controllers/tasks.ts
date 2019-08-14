/**
 * Created by ChengZheLin on 2019/8/9.
 * Features:
 */
import { Context } from 'koa'
import Tasks from '../models/Tasks'
import Users from '../models/Users'
import _ from 'lodash'

export async function getTasksList (ctx: Context, next: Function): Promise<void> {
    let [list, pages] = await Promise.all([
        await Tasks.selectTasksAll(),
        await Users.count()
    ])
    await next()
    ctx.render(200, {
        list,
        pages
    })
}

export async function addTasksItem (ctx: Context, next: Function): Promise<void> {
    const body = ctx.request.body
    const res = await Tasks.addTaskItem({
        created_at: Math.ceil(_.now() / 1000),
        ...body
    })
    await next()
    ctx.render(200, res.length > 0)
}
