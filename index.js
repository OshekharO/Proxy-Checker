const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { Agent } = require('https');
const request = require('request').defaults({
  rejectUnauthorized: false,
  agent: new Agent(),
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let timeout = 2;

io.on('connection', (socket) => {
  socket.on('timeout', (value) => {
    timeout = value;
  });

  socket.on('check', (text) => {
    const proxies = text.split('\n');
    proxies.forEach((proxy) => {
      request.get({
        url: 'https://hostslick.com',
        strictSSL: true,
        agent: new Agent(`http://${proxy}`),
        timeout: timeout * 1000,
      }, (error, response, body) => {
        if (!error && response.body.includes('VPS')) {
          socket.emit('work', proxy);
          console.log(`Cloudflare Live Proxy: ${proxy}`);
        }
      });
    });
  });
});

server.listen(8701, () => {
  console.log(`Listening on localhost:8701`);
});
