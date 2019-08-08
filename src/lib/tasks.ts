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
import { CronJob } from 'cron'
import path from 'path'
import md5 from 'md5'
import rq from './request'
import fsext from 'fs-extra'
import knex from 'knex'
// import { VM } from 'vm2'
import TasksModel from '../models/Tasks'
import { db } from './database'

function resolve(p: string): string {
    return path.resolve(__dirname, '../../' + p)
}
// 获取数据库配置
const {database} = require(resolve('crab.config.js'))

const test = `{
    async request () {
        return []
    },

    test () {
        this.save(1111)
        console.log(this)
    }
}`

export class Tasks {
    db: undefined | knex = db
    rq = rq
    tasks: {
        [key: string]: any
    } = {}

    constructor() {
        TasksModel.selectTasks()
            .then(tasks => {
                this.tasksLoad(tasks)
            })
            .catch((e: Error) => {
                console.error(e)
            })
    }

    /**
     * 执行回调方法
     * @param def
     */
    async carried(def: any): Promise<void> {
        let data = def.request && await def.request({rq})
        const isUpdate = def.hasOwnProperty('update')
        const isSave = def.hasOwnProperty('save')
        const inSave = 'save' in def
        const inUpdate = 'update' in def

        if (!data) {
            console.info('request方法未return数据')
            return
        }

        if (isSave) {
            def.save(data)
        } else if (isUpdate) {
            def.update(data)
        } else if (inSave) {
            def.save(data)
        } else if (inUpdate) {
            def.update(data)
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
        let def = new Function(`return ${task.code}`)() || {}
        def = Object.assign(Object.create(database || {}), def, task, {
            rq,
            tools: {
                md5,
                fs: fsext,
                _,
            },
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
    tasksLoad(tasks: TaskArrayItem[]) {
        tasks.forEach(task => {
            let _timer = this.generateTimer(task)
            this.tasks[task.tid] = {
                ...task,
                _timer
            }
        })
    }
}
