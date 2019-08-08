/**
 * Created by ChengZheLin on 2019/8/7.
 * Features:
 */

import { db, _TASKS_TABLE } from '../lib/database'
import { TaskArrayItem } from '../lib/tasks'

export default class Tasks {
    constructor () {}

    static async select (ops?: object): Promise<TaskArrayItem[]> {
        return await db.select()
            .where(function () {
                ops && this.where(ops)
            })
            .from(_TASKS_TABLE)
    }

    static async selectTasks (): Promise<TaskArrayItem[]> {
        return await db.select()
            .where('open', '=', 1)
            .whereNotNull('table')
            .whereNotNull('code')
            .whereNotNull('cron')
            .from(_TASKS_TABLE)
    }
}
