"use client";

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client'
import Chat from '@/components/chat'
import Restart from '@/components/restart';
import { CellOnChange, CrossState, GameSide } from '@/lib/types';
import Cross from '@/components/crossword';

let socket: Socket;

export default function Game({ params }: { params: { id: string } }) {
    const [socketReady, setSocketReady] = useState(false)
    const [game, setGame] = useState<GameSide>();
    const [state, setState] = useState<CrossState>();
    
    async function initSocket() {
        await fetch('/api/socket')

        socket = io('', {
            path: "/api/socket_io",
            query: { dir: 'game', id: params.id }
        })

        socket.on('disconnect', () => {
            console.log('disconnect')
            // throw new Error()
        })

        socket.on('begin', (g: GameSide) => {
            setGame(g)
        })

        socket.on('state', (g: GameSide) => {
            setState(g.state)
        })

        setSocketReady(true)
    }

    useEffect(() => {
        initSocket()
    }, [])

    const onChange: CellOnChange = (x, y, prev, char) => {
        socket.emit('claim', {
            x, y, char
        })
    }

    return <>
        <div className="mx-32 mt-10">
            { !(game && state) ||
                <Cross state={state} side={game.side}
                    onChange={onChange} /> }
            { !(socketReady && game) ||
                <Chat socket={socket}
                    game={game} /> }
        </div>
        <Restart />
    </>
}