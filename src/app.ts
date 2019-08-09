import Koa from 'koa'
import { Context } from 'koa'
import json from 'koa-json'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import { Tasks } from './lib/tasks'
import router from './routes'
import render from './middleware/render'
import { db } from './lib/database'
const onerror = require('koa-onerror')

// const index = require('./routes/index')
// const users = require('./routes/users')

const tasks = new Tasks()
const app = new Koa()
app.context.db = db
app.context.tasks = tasks

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(render())
// app.use(require('koa-static')(__dirname + '/public'))

/* app.use(views(__dirname + '/views', {
  extension: 'pug'
})) */

// logger
app.use(async (ctx, next) => {
  const start: number = new Date().getTime()
  await next()
  const ms: number = new Date().getTime() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(router.routes())
// app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err: Error, ctx: Context) => {
  console.error('server error', err, ctx)
});

export {
  app
}
