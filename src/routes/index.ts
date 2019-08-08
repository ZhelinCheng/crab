/**
 * Created by ChengZheLin on 2019/8/8.
 * Features:
 */

import Router from 'koa-router'
import AllowedMethods from '../middleware/allowedMethods'
import tasks from './tasks'
import admin from './admin'
import users from './users'
const router: Router = new Router()

const _BASE_URL = '/api/v1'

// 爬虫任务接口
router.use(`${_BASE_URL}/tasks`, AllowedMethods.allowed, tasks.routes())

// 管理后台公共接口
router.use(`${_BASE_URL}/admin`, AllowedMethods.allowed, admin.routes())

// 用户接口
router.use(`${_BASE_URL}/users`, users.routes())

export default router
