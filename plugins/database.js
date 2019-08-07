/**
 * Created by ChengZheLin on 2019/8/7.
 * Features:
 */

'use strict'

module.exports = {
  async save (table, data, ops) {
    console.log('公共数据保存方法', table)
    return true
  },

  async update (table, data, ops) {
    console.log('公共数据更新方法')
  }
}
