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

export async function putTaskItem(ctx: Context, next: Function): Promise<void> {
    const body = ctx.request.body
    const res = await Tasks.updateTask(body)
    const tasks = ctx.tasks
    const tid = body.where.tid
    let task = tasks.tasks[tid]
    await next()
    if (!task) {
        task = await Tasks.select({
            tid
        })
        tasks.pushTask(task[0])
    }
    if (res > 0) {
        tasks.timerHandle(body.where.tid, body.update.open > 0)
    }
    if (res > 0 && task) {
        ctx.render(200, true)
    } else {
        ctx.render(200, false)
    }
}

export async function getTasksInfo(ctx: Context, next: Function): Promise<void> {
    const tid = ctx.request.query
    const task = await Tasks.select(tid)
    await next()
    ctx.render(200, task[0] || {})
}

export async function delTaskItem(ctx: Context, next: Function): Promise<void> {
    const tid = ctx.request.query
    const res = await Tasks.delete(tid)
    await next()
    ctx.render(200, res > 0)
}
