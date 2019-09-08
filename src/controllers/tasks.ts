/**
 * Created by ChengZheLin on 2019/8/9.
 * Features:
 */
import {Context} from 'koa'
import Tasks from '../models/Tasks'
import Users from '../models/Users'
import _ from 'lodash'
import construct = Reflect.construct

export async function getTasksList(ctx: Context, next: Function): Promise<void> {
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

export async function addTasksItem(ctx: Context, next: Function): Promise<void> {
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
  const tasks = ctx.tasks
  const tid = body.where.tid
  let task = tasks.tasks[tid]
  let updateRes = await Tasks.updateTask(body)
  let taskInfo = await Tasks.select({tid})
  await next()
  try {
    if (body.update.hasOwnProperty('open') && updateRes) {
      tasks.timerHandle(body.where.tid, body.update.open > 0)
    } else {
      if (task) {
        tasks.deleteTask(tid)
      }
      tasks.pushTask(taskInfo[0])
    }
    ctx.render(200, true)
  } catch (e) {
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
