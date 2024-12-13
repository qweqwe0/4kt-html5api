const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let clients = []; 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Пользователь подключился к WebSocket');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    broadcastNewMessage(msg); 
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился от WebSocket');
  });
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.push(res); 

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

function broadcastNewMessage(message) {
  clients.forEach(client => client.write(`data: ${JSON.stringify(message)}\n\n`));
}

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
