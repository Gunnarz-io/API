require('dotenv').config()
const WebSocket = require('ws')
const server = require('http').createServer()
const express = require('express')
const app = express()
const cors = require('cors')
const EventEmitter = require('events')
const emitter = new EventEmitter()
const password = process.env['password']
const wsServer = new WebSocket.Server({ server: server })
var serverData = []

server.on('request', app)

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(404).send(
        `mfw`
    );
});

app.get(`/servers`, (req, res) => {
    if (serverData.length > 0) res.status(200).send(serverData);
    else res.status(200).send({
        'error': 'No servers online.'
    });
});

wsServer.on('connection', function(ws, req) {
  if (req.headers.password != password) {
    ws.close()
    return
  }
  ws.on('message', function(event) {
    msg = JSON.parse(event)
    delete msg.password
    if(serverData.length > 0) {
        for(var i in serverData) {
            if(serverData[i].id == msg.id) {
                serverData[i] = msg
                serverData[i].lastUpdate = Date.now()
                exists = true
                break
            }
        }
        if(!exists) {
            serverData.push(msg)
            serverData[serverData.length-1].lastUpdate = Date.now()
            console.log(`Server ${msg.id} online`)
        }
    }
    else {
        serverData.push(msg)
        serverData[serverData.length-1].lastUpdate = Date.now()
        console.log(`Server ${msg.id} online`)
    }
  })
})

setInterval(() => {
    for(var i in serverData) {
        if(Date.now() - serverData[i].lastUpdate > 16000) {
            console.log(`Server ${serverData[i].id} offline`)
            serverData.splice(serverData.indexOf(serverData[i]), 1)
        }
    }
}, 1000)

app.post(`/createAccount`, (req, res) => {
  var creds = req.body.data
  var serverID = req.body.server
  emitter.emit('createAccount', creds, res, serverID)
})

app.post(`/logout`, (req, res) => {
  var username = req.body.data 
  emitter.emit('logout', username, res)
})

app.post(`/login`, (req, res) => {
  var creds = req.body.data
  var serverID = req.body.server
  emitter.emit('login', creds, res, serverID)
})

server.listen(8000, function() {
  console.log(`http-ws api listening on ${8000}`)
})
