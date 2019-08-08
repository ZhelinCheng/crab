/**
 * Created by ChengZheLin on 2019/8/9.
 * Features:
 */

import Router from 'koa-router'
import AllowedMethods from '../middleware/allowedMethods'
import * as tasks from '../controllers/tasks'
const router: Router = new Router()

router.use(['/reset', '/sign'], AllowedMethods.allowed)

// 登录
router.post('/login', AllowedMethods.login)

// 重置
router.post('/reset', ctx => {
    ctx.body = 1111
})

// 注册
router.post('/sign')

export default router
