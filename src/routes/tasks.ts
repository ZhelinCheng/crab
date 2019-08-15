/**
 * Created by ChengZheLin on 2019/8/8.
 * Features:
 */
import Router from 'koa-router'
import * as tasks from '../controllers/tasks'
const router: Router = new Router()

router.get('/', tasks.getTasksList)

// 获取任务信息
router.get('/item-info', tasks.getTasksInfo)

// 添加任务
router.post('/item-add', tasks.addTasksItem)

// 更新任务
router.put('/item-update', tasks.putTaskItem)

// 删除任务
router.del('/item-del', tasks.delTaskItem)

export default router
