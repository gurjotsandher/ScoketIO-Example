const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
let nickname;
let online_users = {}

app.get('/', (req,res) => {

    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {

    // We use a prompt on the client side script that sends
    // the listening event contain the name
    // the socket that is passed in contains an ID
    // that ID can be obtained socket.id
    
    socket.on('nickname', (nickname) => {
        console.log(`a user named ${nickname} connected`)
        this.nickname = nickname
        
        // Lists cannot be emitted in the io socket
        // This is why I use a list, it contains the socket ID
        // so I can delete users from the list easily later on.
        online_users[this.nickname] = socket.id
        socket["nickname"] = this.nickname

        // TODO: Why is IO used here instead of socket?
        // Look at the info.txt file.
        io.emit('online users', online_users) 

        // that socket can broadcast and emit a listening event
        // that broadcasts to the other sockets
        socket.broadcast.emit("arrived", `${nickname} joined the chat`)
    })

    // We listen to see who the server identifies to be typing
    // We use broadcast because the user who is typing doesn't
    // need to see that he/she is typing. 
    socket.on('isTyping', (user) => {
        if(user.isTyping){
            socket.broadcast.emit("isTyping", `${user.nickname} is typing...`)
            console.log(`${user.nickname} is typing...`)
        }
    })

    // Logging a message sent on the client to the server shell
    // By using broadcast we send it to all of the other users 
    // except for the sender
    socket.on('chat message', (message) => {
        console.log(`message: ${message}`)
        socket.broadcast.emit('chat message', message)
    })

    socket.on('disconnect', (reason) => {
        console.log('disconnecting user: ' + online_users[socket.nickname])
        delete online_users[socket.nickname]
        console.log(online_users)
        io.emit('online users', online_users)
    })
})
    

port = 3000
server.listen(port, () => {
    console.log(`Listening on: ${port} 🚀`)
})