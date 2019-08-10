#!/usr/bin/env node

/**
 * Module dependencies.
 */

import { app } from '../app'
import Debug from 'debug'
import http from 'http'
import WebSocket from 'ws'

const debug = Debug('server')
/**
 * Get port from environment and store in Express.
 */

const port: number = normalizePort(process.env.PORT || '4010')

/**
 * Create HTTP server.
 */

const wss = new WebSocket.Server({port: port + 1})

wss.on('connection', function connection(ws) {
    console.log(1111)

    ws.on('message', function incoming(message) {
        console.log('received: %s', message)
    })

    ws.send('something')
})

app.context.wss = wss
const server = http.createServer(app.callback())

/**
 * Listen on provided port, on all network interfaces.
 */

server.on('error', onError)
server.on('listening', onListening)
server.listen(port)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string): number {
    const port: number = parseInt(val, 10)
    if (isNaN(port)) {
        return 4010
    }
    return port
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
    if (error.syscall !== 'listen') {
        throw error
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges')
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(bind + ' is already in use')
            process.exit(1)
            break
        default:
            throw error
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address()
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port
    debug('Listening on ' + bind)
}
