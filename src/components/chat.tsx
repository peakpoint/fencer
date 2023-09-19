import { FormEvent, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { GameSide, Message, MessageData, Side } from "@/lib/types";

export default function Chat({ socket, game } :
    { socket: Socket, game: GameSide }
) {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [msgKey, setMsgKey] = useState(0)

    const otherSide: Side = game.side == 'red' ? 'blue' : 'red'

    function storeMsg(msg: MessageData, side: Side) {
        setMessages([...messages, { ...msg, key: msgKey, side } ])
        setMsgKey(msgKey + 1)
    }

    useEffect(() => {
        socket.on('message', (msg: MessageData) => {
            storeMsg(msg, otherSide)
        })
    }, [])

    function handleSend(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (message == '') return

        socket.emit('message', message)
        
        setMessage('')
        storeMsg({ username: game.username, content: message }, game.side)
    }

    return (<div>
        <div className=
            'h-32 border-white border-solid border overflow-y-auto w-1/2'>
            {messages.map(m => {
                return <p key={m.key}>
                    <span className={
                        `pl-2 pr-4
                        ${m.side == 'red' ?
                        'text-red-600' :
                        'text-blue-500'}`}
                    >{m.username}</span>
                    <span>{m.content}</span>
                </p>
            })}
        </div>
        <form onSubmit={handleSend}>
            <input
                className="text-black"
                type="test"
                value={message}
                onChange={e => setMessage(e.target.value)}
            ></input>
            <button type="submit"
                className="ml-4 bg-neutral-700 rounded hover:bg-gray-500 px-3 py-1"
            >Send</button>
        </form>
    </div>)
}
