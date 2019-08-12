/**
 * Created by ChengZheLin on 2019/8/7.
 * Features: 生命周期
 */


export interface TaskItem {
    task: (ctx: any) => void
}

export interface TaskArrayItem {
    tid: number,
    title: string,
    table: string,
    cron: string,
    type: number,
    error_time?: number,
    code?: string,
    open: 0 | 1
}

import _ from 'lodash'
import cheerio from 'cheerio'
import { CronJob } from 'cron'
import path from 'path'
import { createTasksTable } from './database'
import rq from './request'
// import { VM } from 'vm2'
import TasksModel from '../models/Tasks'

function resolve(p: string): string {
    return path.resolve(__dirname, '../../' + p)
}
// 获取数据库配置
const {database} = require(resolve('crab.config.js'))

const test = `const task = {
    save () {
        console.log(111)
    }
}`

export class Tasks {
    rq = rq
    tasks: {
        [key: string]: any
    } = {}

    constructor () {
        createTasksTable().then((exists) => {
            exists && this.tasksLoad()
        })
    }

    /**
     * 执行回调方法
     * @param def
     */
    async carried(def: any): Promise<void> {
        let ctx: any = {
            rq,
            _,
            $: cheerio
        }

        let data = def.onRequest && await def.onRequest(ctx)
        const isUpdate = def.hasOwnProperty('update')
        const isSave = def.hasOwnProperty('save')
        const inSave = 'save' in def
        const inUpdate = 'update' in def

        if (!data) {
            console.info('request方法未return数据')
            return
        }

        ctx.data = data
        if (isSave) {
            def.onSave(ctx)
        } else if (isUpdate) {
            def.onUpdate(ctx)
        } else if (inSave) {
            def.onSave(ctx)
        } else if (inUpdate) {
            def.onUpdate(ctx)
        } else {
            console.info('你未定义任何方法')
        }
    }

    /**
     * 定时器处理
     * @param tid
     * @param start
     */
    timerHandle(tid: number, start: boolean) {
        try {
            let _timer = this.tasks[tid]._timer
            if (start) {
                _timer && _timer.start()
            } else {
                _timer && _timer.stop()
            }
        } catch (e) {
            console.error(e)
        }
    }
    /**
     * 生成定时器
     * @param task
     */
    generateTimer(task: TaskArrayItem) {
        const tid = task.tid
        let def = new Function(`${test}; return task`)() || {}
        def = Object.assign(Object.create(database || {}), def, task, {
            stop: this.timerHandle.bind(this, tid, false),
            start: this.timerHandle.bind(this, tid, true),
        })
        return new CronJob(task.cron, async () => {
            try {
                await this.carried(def)
            } catch (e) {
                def.error && def.error(e)
                this.errorHandle(
                    def,
                    10
                )
            }
        }, null, task.open > 0, 'Asia/Shanghai')
    }

    /**
     * 错误处理
     * @param def
     * @param time
     */
    errorHandle(def: any, time: number = 0) {
        try {
            time > 0 && setTimeout(async () => {
                await this.carried(def)
            }, time * 1000)
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * 任务加载
     */
    async tasksLoad() {
        const tasks: TaskArrayItem[] = await TasksModel.selectTasks()
        tasks.forEach(task => {
            let _timer = this.generateTimer(task)
            this.tasks[task.tid] = {
                ...task,
                _timer
            }
        })
    }
}
