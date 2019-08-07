/**
 * Created by ChengZheLin on 2019/8/7.
 * Features:
 */

import rq from './request'

export default {
    async save (table: string, data: any, ops?: any): Promise<boolean> {
        console.log('公共数据保存方法', table)
        return true
    },

    async update (table: string, data: any, ops?: any): Promise<boolean> {
        console.log('公共数据更新方法')
        return true
    }
}
