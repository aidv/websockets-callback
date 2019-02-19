"use strict";

const WebSocket = require('ws');

module.exports = class WebSockets_Callback{
    constructor(options){
        this.options = {}
        this.options = {port: 8081}
        this.options = {...this.options, ...options}

        this.wss = new WebSocket.Server({ port: this.options.port });
        this.ws;

        this.triggers = {}

        this.start();
    }

    log(str){
        if (this.options.verbose) console.log('[ WebSockets-Callback ]  ' + str);
    }

    start(){
        var t = this;
        this.log('Starting server @ port ' + t.options.port + '...')
        this.wss.on('connection', function(conn) {
            if (t.options.onConnection != null) t.options.onConnection(conn)
            t.ws = conn;
            t.ws.on('message', function(message){
                t.process(t, message)
            });
        }).on('error', function(conn, error){
            if (t.options.onError != null) t.options.onError(conn, error)
            console.log('[WS ERROR]')
            console.log(error)
        }).on('listening', function(conn){
            if (t.options.onListening != null) t.options.onConnection(conn)
            t.log('Server listening @ port ' + t.options.port);
        });
    }

    stop(){

    }

    send(data, puid = null){
        if (puid != null) data.puid = puid;
        this.ws.send(JSON.stringify(data));
    }

    process(t, msg){
        var json = JSON.parse(msg);
        t.triggers[json.cmd].doProcess(json, function(response){
            t.send(response, json.puid);
        })
    }

    on(command, doProcess){
        this.triggers[command] = {doProcess: doProcess}
    }
}
