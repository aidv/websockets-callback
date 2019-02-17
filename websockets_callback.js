class websockets_callback{
    constructor(options){

        var defaultOptions = {
            address: '127.0.0.1',
            port: 8081,
            onOpen: undefined
        }
        defaultOptions = {...defaultOptions, ...options}

        this.onResponseList = {};

        var t = this;
        this.ws = new WebSocket('ws://' + defaultOptions.address + ':' + defaultOptions.port);
        this.ws.onopen = function (event) {
            if (defaultOptions.onOpen != undefined) defaultOptions.onOpen();
        };

        this.ws.onmessage = function (event) {
            var json = JSON.parse(event.data);
            if (json.puid != undefined)
                if (t.onResponseList[json.puid] != undefined){
                    t.onResponseList[json.puid](json);
                    delete t.onResponseList[json.puid];
                }
        }
    }

    send(packet, onResponse = null){
        if (packet == undefined) return;

        if (onResponse != undefined){
            var puid = Date.now();
            this.onResponseList[puid] = onResponse;
            packet.puid = puid;
        }
        this.ws.send(JSON.stringify(packet));
    }

    simple(msg, onResponse = null){
        this.send({cmd: msg}, onResponse);
    }
}