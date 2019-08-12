#!/usr/bin/env node

/**
 * Module dependencies.
 */

import AllowedMethods from '../middleware/allowedMethods'
import { app, wss } from '../app'
import Debug from 'debug'
import http from 'http'

const debug = Debug('server')
/**
 * Get port from environment and store in Express.
 */

const port: number = normalizePort(process.env.PORT || '4010')

/**
 * Create HTTP server.
 */
const server = http.createServer(app.callback())
const wsServer = http.createServer()


/**
 * Listen on provided port, on all network interfaces.
 */
server.on('error', onError)
server.on('listening', onListening)
server.listen(port)

/**
 * ws链接及权限校验
 */
wsServer.on('upgrade', function upgrade(request, socket, head) {
    const isAllowed = AllowedMethods.wsAllowed()
    if (!isAllowed) {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    } else {
        console.log(111)
        socket.destroy()
    }
});
wsServer.listen(port + 1)

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
