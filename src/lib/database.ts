/**
 * Created by ChengZheLin on 2019/8/7.
 * Features:
 */
import knex, { TableBuilder } from 'knex'
import fsext from 'fs-extra'
import path from 'path'

function resolve(p: string): string {
    return path.resolve(__dirname, '../../' + p)
}

const {database} = require(resolve('crab.config.js'))

// 任务列表
const _TASKS_TABLE = 'c_tasks'
// 类型列表
const _TYPES_TABLE = 'c_types'
// 用户表
const _USERS_TABLE = 'c_users'


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

    // 创建用户表
    db.schema.hasTable(_USERS_TABLE).then(function (exists) {
        if (!exists) {
            return db.schema.createTable(_USERS_TABLE, function (t: TableBuilder) {
                t.increments('uid').primary()
                t.string('name', 16).notNullable().index('name')
                t.string('hash', 130).notNullable()
                t.string('nickname', 16)
                t.boolean('admin').defaultTo(0)
                t.boolean('execute').defaultTo(1)
            })
        }
    })

    // 创建任务表
    db.schema.hasTable(_TASKS_TABLE).then(function (exists) {
        if (!exists) {
            return db.schema.createTable(_TASKS_TABLE, function (t: TableBuilder) {
                t.increments('tid').primary()
                t.integer('created_at').notNullable().index('created_at')
                t.string('title', 30).defaultTo('新建任务')
                t.string('table', 30)
                t.string('cron', 30)
                t.integer('type', 3).defaultTo(1)
                t.integer('error_time', 4).defaultTo(0)
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
    _TYPES_TABLE,
    _USERS_TABLE
}
