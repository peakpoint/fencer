import { Socket } from "socket.io-client"

// restart button
export default function Restart() {

    return (
        <button className='mt-5 bg-red-500'
            onClick={async () => {
                await fetch('/api/socket', {
                method: 'POST',
                body: 'restart'
                })

                // router.refresh()
            }}
            >
            restart socket io
        </button>)
}