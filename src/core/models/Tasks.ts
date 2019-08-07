/**
 * Created by ChengZheLin on 2019/8/7.
 * Features:
 */

import { db, _TASKS_TABLE } from '../lib/database'
import { TaskArrayItem } from '../lib/tasks'

export default class Tasks {
    constructor () {}

    async select (tid?: string): Promise<TaskArrayItem[]> {
        return await db.select()
            .where('td', '=', tid)
            .from(_TASKS_TABLE)
    }
}
