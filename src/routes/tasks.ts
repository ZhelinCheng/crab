/**
 * Created by ChengZheLin on 2019/8/8.
 * Features:
 */
import Router from 'koa-router'
import * as tasks from '../controllers/tasks'
const router: Router = new Router()

router.get('/', tasks.getTasksList)

// 添加任务
router.post('/item-add', tasks.addTasksItem)

export default router
