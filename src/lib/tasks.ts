/**
 * Created by ChengZheLin on 2019/8/7.
 * Features: 生命周期
 */
import _ from 'lodash'
import moment from 'moment'
import cheerio from 'cheerio'
import { CronJob } from 'cron'
import path from 'path'
import { createTasksTable } from './database'
import rq from './request'
import { NodeVM, VMScript } from 'vm2'
import TasksModel from '../models/Tasks'

export interface TaskArrayItem {
  created_at: number | string,
  tid: number,
  title: string,
  table: string,
  cron: string,
  type: number,
  error_time?: number,
  code?: VMScript,
  open: 0 | 1
}


function resolve(p: string): string {
  return path.resolve(__dirname, '../../' + p)
}

function logs(msg: string): void {
  let date = moment().format()
  if (this && this.ws) this.ws.send(JSON.stringify({
    type: 'default',
    date,
    msg
  }))
  else console.log(`[${date}] ${JSON.stringify(msg)}`)
}

const vm = new NodeVM({
  console: 'inherit',
  timeout: 5000,
  sandbox: {
    rq,
    moment,
    $: cheerio,
    _,
    logs
  }
})

// 获取数据处理方法
const {dataHandle} = require(resolve('crab.config.js'))

export class Tasks {
  rq = rq
  tasks: {
    [key: string]: any
  } = {}

  constructor() {
    createTasksTable().then((exists) => {
      exists && this.tasksLoad()
    })
  }

  /**
   * 执行回调方法
   * @param def
   * @param ws
   */
  async carried(def: any, ws?: any): Promise<void> {
    let data = def.onRequest && await def.onRequest()

    if (!data) {
      logs.call({ws}, 'onRequest方法未return数据')
      return
    }

    // 处理数据
    if (def.onHandle) {
      def.onHandle(data)
    } else {
      logs.call({ws}, '未定义onHandle方法')
    }
  }

  /**
   * 定时器处理
   * @param tid
   * @param start
   */
  timerHandle(tid: number | string, start: boolean) {
    let _timer = this.tasks[tid]._timer
    if (start) {
      _timer && _timer.start()
    } else {
      _timer && _timer.stop()
    }
  }

  /**
   * 生成定时器
   * @param task
   */
  generateTimer(task: TaskArrayItem) {
    const tid = task.tid
    let def = vm.run(task.code)
    def = Object.assign(Object.create(dataHandle || null), def, task, {
      stop: this.timerHandle.bind(this, tid, false),
      start: this.timerHandle.bind(this, tid, true),
    })

    return new CronJob(task.cron, async () => {
      try {
        await this.carried(def)
      } catch (e) {
        console.error(e)
        def.error && def.error(e)
        this.errorHandle(
          def,
          def.error_time
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
   * 添加任务
   * @param task
   */
  pushTask(task: any): TaskArrayItem | boolean {
    if (!task) return

    try {
      let _timer = this.generateTimer(task)
      this.tasks[task.tid] = {
        ...task,
        _timer
      }
      return task
    } catch (e) {
      console.error(e)
      return false
    }
  }

  /**
   * 删除任务
   */
  deleteTask(tid: number): boolean {
    try {
      this.timerHandle(tid, false)
      delete this.tasks[tid]
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * 任务加载
   */
  async tasksLoad() {
    const tasks: TaskArrayItem[] = await TasksModel.selectTasks()
    tasks.forEach(task => {
      this.pushTask(task)
    })
  }

  /**
   * 测试代码
   * @param code
   * @param ws
   */
  async testCode(code: VMScript, ws: any) {
    try {
      const testVm = new NodeVM({
        console: 'inherit',
        timeout: 5000,
        sandbox: {
          rq,
          moment,
          $: cheerio,
          _,
          logs: logs.bind({
            test: true,
            ws
          })
        }
      })
      let def = testVm.run(code)
      def = Object.assign(Object.create(dataHandle || null), def, {
        test: true
      })
      await this.carried(def, ws)
    } catch (e) {
      ws.send(JSON.stringify({
        date: moment().format(),
        type: 'error',
        msg: e.name + ' ' + e.message
      }))
    }
  }
}
