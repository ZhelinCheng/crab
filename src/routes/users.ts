/**
 * Created by ChengZheLin on 2019/8/9.
 * Features:
 */

import Router from 'koa-router'
import AllowedMethods from '../middleware/allowedMethods'
import * as users from '../controllers/users'
const router: Router = new Router()

router.use(['/reset'], AllowedMethods.allowed)

// 登录
router.post('/login', AllowedMethods.login)

// 重置
router.post('/reset', users.reset)

// 注册
router.post('/registered', users.registered)

export default router
