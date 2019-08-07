/**
 * Created by ChengZheLin on 2019/8/7.
 * Features: 生命周期
 */
import { CronJob } from 'cron'
import glob from 'glob'
import path from 'path'
import md5 from 'md5'
import rq from './request'
import fsext from 'fs-extra'
import fs from 'fs'

// const config = require('../../../crab.config')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

// 获取及初始化数据库
const adapter = new FileSync(resolve('../../../db.json'))
const db = low(adapter)
db.defaults({ tasks: {} , user: {} })
    .write()

function resolve (p: string): string {
    return path.resolve(__dirname, p)
}

interface TaskItem {
    task: (ctx: any) => void
}

class Tasks {
    lowdb: any
    pdb: any
    list: {
        [key: string]: any
    } = {}
    constructor () {
        try {
            this.lowdb = db
            this.pluginsLoad()
            this.tasksLoad()
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * 插件加载
     */
    pluginsLoad () {
        const dbPath = resolve('../../../plugins/database.js')
        const isDb = fs.existsSync(dbPath)
        if (isDb) {
            this.pdb = require(dbPath)
        }
    }

    /**
     * 任务加载
     */
    tasksLoad () {
        const tasks = glob.sync(resolve('../../../tasks/**/*.js'))
        tasks.forEach((item: string) => {
            const tid: string = md5(item).substring(0, 8)
            const taskItem: TaskItem = require(item)
            const dbName = `tasks.${tid}`

            let taskNewConf = {
                tid,
                open: false,
                file: item,
                cron: '',
                type: 'all',
            }
            if (!db.has(dbName).value()) {
                db.set(dbName, taskNewConf).write()
            } else {
                taskNewConf = db.get(dbName).value()
            }

            const that = this
            this.list[tid] = {
                ...taskNewConf,
                task: (function () {
                    const cron = taskNewConf.cron
                    const open = taskNewConf.open
                    return new CronJob(cron, async function() {
                        taskItem.task && await taskItem.task({
                            ...taskNewConf,
                            rq,
                            stop: that.stop.bind(that, tid),
                            start: that.start.bind(that, tid),
                            save: that.save.bind(that),
                            update: that.update.bind(that)
                        })
                    }, null, open && cron.length > 0, 'Asia/Shanghai');
                }())
            }
        })
    }

    /**
     * 停止任务
     * @param tid
     */
    stop (tid?: string): void {
        if (tid) {
            const taskItem = this.list[tid]
            taskItem && taskItem.cron && taskItem.task && taskItem.task.stop()
            db.set(`tasks.${tid}.open`, false).write()
        } else {
            for (let key in this.list) {
                const taskItem = this.list[key]
                taskItem.cron && taskItem.task && taskItem.task.stop()
                db.set(`tasks.${tid}.open`, false).write()
            }
        }
    }

    /**
     * 启动任务
     * @param tid
     */
    start (tid?: string): void {
        if (tid) {
            const taskItem = this.list[tid]
            taskItem && taskItem.cron && taskItem.task && taskItem.task.start()
            db.set(`tasks.${tid}.open`, false).write()
        } else {
            for (let key in this.list) {
                const taskItem = this.list[key]
                taskItem.cron && taskItem.task && taskItem.task.start()
                db.set(`tasks.${tid}.open`, false).write()
            }
        }
    }

    /**
     * 数据保存
     * @param table
     * @param data
     * @param ops
     */
    async save (table: string, data: any, ops?: any): Promise<boolean> {
        if (this.pdb) {
            return await this.pdb.save(table, data, ops)
        } else {
            console.info('你未定义数据保存方法')
            return false
        }
    }

    /**
     * 数据更新方法
     * @param table
     * @param data
     * @param ops
     */
    async update (table: string, data: any, ops?: any): Promise<boolean> {
        if (this.pdb) {
            return await this.pdb.update(table, data, ops)
        } else {
            console.info('你未定义数据更新方法')
            return false
        }
    }
}


export default Tasks
