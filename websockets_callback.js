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
            if (json.puid != undefined){
                
                if (t.onResponseList[json.puid] != undefined){
                    if (json.progress == undefined || json.progress == 100){
                        t.onResponseList[json.puid].onResponse(json);
                        delete t.onResponseList[json.puid];
                    } else {
                        t.onResponseList[json.puid].onProgress(json);
                    }
                }
            }
        }
    }

    send(packet, onResponse = null, onProgress = null){
        if (packet == undefined) return;

        if (onResponse != undefined){
            var puid = Date.now();
            this.onResponseList[puid] = {onResponse: onResponse, onProgress: onProgress};
            packet.puid = puid;
        }
        this.ws.send(JSON.stringify(packet));
    }

    simple(msg, onResponse = null){
        this.send({cmd: msg}, onResponse);
    }
}