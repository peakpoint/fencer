"use client";

// import Image from 'next/image'
// import Crossword from '@jaredreisinger/react-crossword'
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client'
import Restart from '@/components/restart';

let socket: Socket;

export default function Home() {
  const router = useRouter()
  const [waiting, setWaiting] = useState(false);
  const [username, setUsername] = useState('')

  useEffect(() => {
    fetch('/api/socket').finally(() => {
      socket = io('', {
        path: "/api/socket_io"
      });

      socket.on('connect', () => {
        console.log('client: connected')
      })

      socket.on('disconnect', () => {
        console.log('client: disconnected')
      })

      socket.on('start', url => {
        router.push(`/game/${url}`)
      })
    })
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setWaiting(true)

    // const form = e.target as HTMLFormElement
    // const formData = new FormData(form)

    // // const { username } = Object.fromEntries(formData.entries())
    // // console.log(Object.fromEntries(formData.entries()))

    // const res = await fetch('/api/queue', {
    //   method: form.method,
    //   body: formData
    // })

    // const json = await res.json()
    
    // setWaiting(false)
    // console.log('done waiting')

    socket.emit('queue', username)
    // push('/game/test')
  }

  return (
    <main className="">
      <div className='w-36 text-white'>
        {waiting ? <p>In Queue</p> :
        <form
          onSubmit={handleSubmit}
          // method='POST'
          >
          <label>Username
            <input type='text'
              name='username'
              value={username}
              onChange={e => setUsername(e.target.value)}
              className='text-black' />
          </label>
          <button type='submit'>Enter Queue</button>
        </form>}
        <Restart />
      </div>
    </main>
  )
}
