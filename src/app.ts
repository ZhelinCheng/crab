import Koa from 'koa'
import { Context } from 'koa'
import json from 'koa-json'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import { Tasks } from './lib/tasks'
import router from './routes'
import render from './middleware/render'
import { db } from './lib/database'
import WebSocket from 'ws'
import { VMScript } from 'vm2'

const onerror = require('koa-onerror')

const app = new Koa()
const wss = new WebSocket.Server({noServer: true})
const tasks = new Tasks()
app.context.db = db
app.context.tasks = tasks

function noop() {}

function heartbeat() {
    this.isAlive = true;
}

wss.on('connection', function connection(ws: any) {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.on('message', async function message(code: VMScript) {
        await tasks.testCode(code, ws)
    })
    ws.send(JSON.stringify({
        date: 'WebSocket',
        msg: '准备就绪'
    }))
});

setInterval(function ping() {
    wss.clients.forEach(function each(ws: any) {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false
        ws.ping(noop)
    });
}, 30000);

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
})

export {
    app,
    wss
}
