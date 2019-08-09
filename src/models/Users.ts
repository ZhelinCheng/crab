/**
 * Created by ChengZheLin on 2019/8/9.
 * Features:
 */
export interface UserItem {
    uid?: number
    name: string
    hash: string
    nickname?: string
    admin?: number
    execute?: number
}

import { db, _USERS_TABLE } from '../lib/database'

export default class Users {
    static async select (ops: object = {}): Promise<UserItem[]> {
        return await db(_USERS_TABLE).where
        (ops).select()
    }

    /**
     * 注册
     */
    static async registered (user: UserItem): Promise<boolean> {
        const data: any[] = await db(_USERS_TABLE).insert(user)
        return data.length > 0
    }

    /**
     * 表数据数量
     * @param field
     */
    static async count (field: string = 'uid'): Promise<number> {
        const data: {
            [index: number]: {
                count: number
            }
        } = await db(_USERS_TABLE).count(field, { as: 'count' })
        return data[0].count
    }
}
