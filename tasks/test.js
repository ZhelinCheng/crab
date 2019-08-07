/**
 * Created by ChengZheLin on 2019/8/7.
 * Features:
 */

'use strict'

module.exports = {
  async task (ctx) {
    let res = await ctx.rq({
      uri: 'https://api.aiiuii.com/v2/variety/tomorrow/index',
      method: 'get',
      opsJson: true
    })

    console.log(await ctx.save('测试', []))
    ctx.stop()
  }
}
