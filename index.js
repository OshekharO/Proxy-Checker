const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const agent = require('proxy-agent')
const request = require("request").defaults({
    rejectUnauthorized: false
})
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})
var timeout = 2
io.on('connection', function(socket) {
    socket.on('timeout', function(value) {
        timeout = value
    })
    socket.on('check', function(text) {
        var proxies = text.split('\n')
        proxies.forEach(proxy => {
            request.get({
                url: "https://hostslick.com",
                strictSSL: true,
                agent: new agent('http://' + proxy),
                timeout: timeout * 1000
            }, function(error, response, body) {
                if (!error)
                    if (response.body.includes('VPS')) {
                        socket.emit('work', proxy)
                        console.log('Cloudflare Live Proxy: ' + proxy)
                    }
            })
        })
    })
})
server.listen(8701, function() {
    console.log(`Listening on localhost:8701`)
})
