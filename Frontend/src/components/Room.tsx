import React, { useEffect, useRef } from 'react'
import socket from '../utils/socket'

const Room : React.FC= () => {
    const roomId = useRef(null);

    useEffect(() => {
        socket.connect();
        return() => { socket.disconnect(); }
    }, [])
  return (
    <div>
        <h2>Room</h2>
        <input type="text" ref={roomId} />
        <button onClick={() => {
            socket.emit("create-room");
        }}> Create Room</button>
        <button onClick={() => {
            if(roomId.current){
                socket.emit("join-room", JSON.parse(JSON.stringify(roomId.current.value)));   
            }
            else{
                console.log("Enter valid room ID");
            }
        }}>JOIN ROom</button>
    </div>
  )
}

export default Room