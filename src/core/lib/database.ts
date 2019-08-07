/**
 * Created by ChengZheLin on 2019/8/7.
 * Features:
 */
import knex, { TableBuilder } from 'knex'
import fsext from 'fs-extra'
import path from 'path'

function resolve(p: string): string {
    return path.resolve(__dirname, '../../../' + p)
}

const {database} = require(resolve('crab.config.js'))

// 任务列表
const _TASKS_TABLE = 'c_tasks'
// 类型列表
const _TYPES_TABLE = 'c_types'


let db: knex | undefined = undefined
if (!db) {
    const dbFile = resolve(database.filename || 'crab.db')
    fsext.ensureFileSync(dbFile)
    db = knex({
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: dbFile
        }
    })

    // 创建任务表
    db.schema.hasTable(_TASKS_TABLE).then(function (exists) {
        if (!exists) {
            return db.schema.createTable(_TASKS_TABLE, function (t: TableBuilder) {
                t.string('tid', 8).primary().notNullable()
                t.string('file', 200).notNullable()
                t.string('cron', 30)
                t.integer('type', 3).defaultTo(1)
                t.text('code')
                t.boolean('open').defaultTo(0)
            })
        }
    })

    // 创建类型列表
    db.schema.hasTable(_TYPES_TABLE).then(function (exists) {
        if (!exists) {
            return db.schema.createTable(_TYPES_TABLE, function (t: TableBuilder) {
                t.integer('type', 3).notNullable().primary()
                t.string('label', 10).notNullable()
            }).then(async () => {
                await db(_TYPES_TABLE).insert([{type: 1, label: '所有'}])
            })
        }
    })
}

export {
    db,
    _TASKS_TABLE,
    _TYPES_TABLE
}
