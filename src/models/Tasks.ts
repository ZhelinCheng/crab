/**
 * Created by ChengZheLin on 2019/8/7.
 * Features:
 */

import { db, _TASKS_TABLE, _TYPES_TABLE } from '../lib/database'
import { TaskArrayItem } from '../lib/tasks'

export default class Tasks {
    constructor () {}

    static async select (ops?: object ): Promise<TaskArrayItem[]> {
        return await db.select()
            .where(function () {
                ops && this.where(ops)
            })
            .from(_TASKS_TABLE)
    }

    static async delete (ops?: object) {
        return await db(_TASKS_TABLE)
            .where(function () {
                ops && this.where(ops)
            })
            .del()
    }

    static async selectTasks (): Promise<TaskArrayItem[]> {
        return await db.select()
            .where('open', '=', 1)
            .whereNotNull('table')
            .whereNotNull('code')
            .whereNotNull('cron')
            .from(_TASKS_TABLE)
    }

    static async selectTasksAll (): Promise<TaskArrayItem[]> {
        return await db.select([
            'tid',
            'created_at',
            'title',
            'table',
            'cron',
            'type',
            'error_time',
            'expire_date',
            'open',
            'label'
        ])
            .from(_TASKS_TABLE)
            .leftOuterJoin(_TYPES_TABLE, `${_TASKS_TABLE}.type`, `${_TYPES_TABLE}.task_type`)
    }

    static async addTaskItem (body: object): Promise<number[]> {
        return await db(_TASKS_TABLE).insert(body)
    }

    static async updateTask (up: any): Promise<number> {
        return await db(_TASKS_TABLE)
            .where(up.where)
            .update(up.update)
    }
}
