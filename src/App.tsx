import { useEffect, useState } from 'react'
import './App.css'

interface message {
  user: String,
  text: String
}

function App() {
  // Chat states
  const [socket, setSocket] = useState<WebSocket | undefined>(undefined)
  const [chatMessages, setChatMessages] = useState<message[]>([])
  const [message, setMessage] = useState<string>('')

  // Join room states
  const [roomId, setRoomId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [joined, setJoined] = useState<boolean>(false)

  // Create WebSocket connection when joined is true
  useEffect(() => {
      // Connect to server with roomId and userName as query parameters
      const socketInstance: WebSocket = new WebSocket(`ws://localhost:8080`)
      setSocket(socketInstance)

      socketInstance.onopen = () => console.log('WebSocket connected')
      socketInstance.onmessage = (event) => {
        console.log('Received:', event.data)
        const data = event.data.toString();
        const payload = JSON.parse(data);
        setChatMessages(prev => [...prev, payload])
      }
      socketInstance.onclose = () => console.log('WebSocket disconnected')

      return () => {
        socketInstance.close()
      }
    
  }, [])

  // Handle sending chat messages
  const handleSend = () => {
    if (socket && socket.readyState === WebSocket.OPEN && message) {
      const payload: object = {
        type: "chat",
        user: userName,
        text: message
      }
      const payload2: message = {
        user: "You",
        text: message
      }
      setChatMessages(prev => [...prev, payload2]);
      socket.send(JSON.stringify(payload));
      setMessage('')
    }
  }

  // Handle joining a room
  const handleJoinRoom = () => {
    if (roomId.trim() && userName.trim()) {
      const payload = { type: "join", roomId: roomId.trim() }
      if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
      setJoined(true)
    }
  }

  return (
    <div className='h-screen bg-gray-900 grid grid-cols-12 grid-rows-12 p-4'>
      {!joined ? (
        <div className='col-span-12 flex flex-col items-center justify-center'>
          <h2 className='text-white text-2xl mb-4'>Join a Chat Room</h2>
          <div className='flex flex-col space-y-4 w-full max-w-md mt-64'>
            <input 
              type='text' 
              placeholder='Room ID'
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className='p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-indigo-500'
            />
            <input 
              type='text' 
              placeholder='Username'
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className='p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-indigo-500'
            />
            <button 
              onClick={handleJoinRoom}
              className='p-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition'
            >
              Join Room
            </button>
          </div>
        </div>
      ) : (
        <div className='bg-gray-800 col-span-4 col-start-5 row-span-10 row-start-2 rounded-2xl flex flex-col justify-between p-4 shadow-lg'>
          <div className='mb-4'>
            <h3 className='text-white text-lg'>Room: {roomId}</h3>
          </div>
          <div className='flex-grow overflow-auto bg-gray-700 p-2 rounded mb-4'>
            {chatMessages.length > 0 
              ? chatMessages.map((msg, index) => (
                  <div key={index} className='mb-2 text-gray-300'>
                    {`${msg.user}: ${msg.text}`}
                  </div>
                ))
              : <p className='text-center text-gray-500'>No messages yet...</p>
            }
          </div>
          <div className='flex space-x-2'>
            <input 
              type='text' 
              placeholder='Type your message...'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='flex-grow p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-indigo-500'
            />
            <button 
              onClick={handleSend}
              className='p-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition'
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App