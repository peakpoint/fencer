import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from 'http'
import type { Socket as NetSocket } from 'net'
import io, { Server, Socket } from 'socket.io'
import { CellBlank, CellChange, ClaimData, Game, GameSide } from "@/lib/types";
import { startGame } from "@/lib/startGame";

/*

https://github.com/vercel/next.js/issues/49334
https://stackoverflow.com/questions/74023393/working-with-typescript-next-js-and-socket-io

*/

interface SocketServer extends HTTPServer {
    io?: Server
}

interface SocketWithIO extends NetSocket {
    server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO
}

interface User {
    username: string
    socket: Socket
}

let queue: User[] = []

type URL = string

export const gameMap = new Map<URL, GameSide>()

function pruneQueue() {
    queue = queue.filter(({ socket }) => socket.connected)
}

function joinQueue(username: string, socket: Socket) {
    queue.push({ username, socket })
    pruneQueue()
}

async function tryStartGame() {
    if (queue.length >= 2) {
        const [
            { username: userRed, socket: socketRed },
            { username: userBlue, socket: socketBlue }
        ] = queue

        queue = queue.slice(2)

        console.log(`red: ${userRed}, blue: ${userBlue}`)

        // maybe include date
        // https://stackoverflow.com/questions/3231459/how-can-i-create-unique-ids-with-javascript
        const gameID = crypto.randomUUID()
        const redURL = crypto.randomUUID()
        const blueURL = crypto.randomUUID()

        const state = await startGame()
        const game: Game = {
            gameID,
            state
        }
        
        gameMap.set(redURL, {
            ...game,
            side: 'red',
            username: userRed,
            competitor: userBlue
        })
        gameMap.set(blueURL, {
            ...game,
            side: 'blue',
            username: userBlue,
            competitor: userRed
        })

        socketRed.emit('start', redURL)
        socketBlue.emit('start', blueURL)
    }
}

function updateGame(game: GameSide, cell: CellBlank) {
    const side = game.side

    for (let clueID of cell.clues) {
        const clue = game.state.clues[clueID]
        clue.visible[side] = true

        for (let [x, y] of clue.cells) {
            game.state.cells[x][y].visible[side] = true
        }

        for (let [x, y] of clue.walls) {
            game.state.cells[x][y].visible[side] = true
        }
    }
}

function initGameSocket(io: io.Server, socket: Socket, id: string) {
    const game = gameMap.get(id)
    
    if (!game) {
        console.log("that game doesn't exist")
        
        // socket.disconnect(true)
        return
    }

    const { gameID } = game

    socket.join(gameID)

    socket.emit('begin', game)
    socket.emit('state', game)

    // socket.on('change', (c: CellChange) => {
    //     if (game.state.cells[c])
    // })

    socket.on('message', (msg: string) => {
        socket.to(gameID).emit('message', {
            username: game.username,
            content: msg
        })
    })

    socket.on('claim', ({x, y, char} : ClaimData) => {
        const cell = game.state.cells[x][y]
        if (cell.status != 'wall' && cell.actual == char) {
            cell.owner = game.side
            console.log('correct', x, y, char)

            updateGame(game, cell)

            io.to(gameID).emit('state', game)
        }
    })
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
    
    if (res.socket.server.io && req.body !== 'restart') {
        console.log('Socket is already running')
        res.end()
        return
    }

    console.log('Socket is initializing')

    // clear the queue
    queue = []
    
    const io = new Server(res.socket.server, {
        path: "/api/socket_io",
        addTrailingSlash: false
    })

    io.on('connection', socket => {
        const query = socket.handshake.query

        if (!query.dir) {
            // main screen
            socket.on('queue', username => {
                console.log(username)
                joinQueue(username, socket)

                // filter disconnected users
                tryStartGame()
            })

            socket.on('disconnect', () => {
                console.log('server: disconnected')
            })

            return
        }

        const { dir, id } = query as { dir: string, id: string }

        console.log('server: connected', dir, id)
        
        if (dir == 'game') {
            initGameSocket(io, socket, id)
        }
    })
    
    res.socket.server.io = io
    res.end()
}

// export const config = {
//     api: {
//         bodyParser: false
//     }
// }
// export const runtime = 'nodejs';

export default SocketHandler
