'use strict';

require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const EventEmitter = require('events');
const emitter = new EventEmitter();
const password = process.env['password']
var serverData = []

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

app.post(`/serverData`, (req, res) => {
    if(req.body.password != password) {
      res.status(401).send('nice try ;)')
      return
    }
    else {
      req.body.password = undefined
    }
    var exists;
    if(serverData.length > 0) {
        for(var i in serverData) {
            if(serverData[i].id == req.body.id) {
                serverData[i] = req.body
                serverData[i].lastUpdate = Date.now()
                exists = true
                break
            }
        }
        if(!exists) {
            serverData.push(req.body)
            serverData[serverData.length-1].lastUpdate = Date.now()
            console.log(`Server ${req.body.id} online`)
        }
    }
    else {
        serverData.push(req.body)
        serverData[serverData.length-1].lastUpdate = Date.now()
        console.log(`Server ${req.body.id} online`)
    }
    res.status(200).send('.')
});

setInterval(() => {
    for(var i in serverData) {
        if(Date.now() - serverData[i].lastUpdate > 10000) {
            console.log(`Server ${serverData[i].id} offline`)
            serverData.splice(serverData.indexOf(serverData[i]), 1)
        }
    }
}, 1000);

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

module.exports = [app, emitter]
