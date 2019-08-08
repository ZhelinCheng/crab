/**
 * Created by ChengZheLin on 2019/8/7.
 * Features:
 */

'use strict'

module.exports = {
  secret: 'fGK7cbcmRyutieTSMUje0wqwYE4sF3dL',
  database: {
    filename: 'crab.db',
    save: function () {
      console.log('全局保存数据方法')
      this.stop()
    },
    update: function () {
      console.log('全局更新数据方法')
      this.stop()
    }
  }
}
