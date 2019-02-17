const WebSocket = require('ws');

var port = 8081;

var ws;
const wss = new WebSocket.Server({ port: port });

console.log('Starting server @ port ' + port + '...')
wss.on('connection', function connection(ws_) {
    ws = ws_;
    ws.on('message', function incoming(message){
        processMsg(message);
    });
}).on('error', function(conn, error){
    console.log('ERROR')
    console.log(error)
}).on('listening', function(conn){
    console.log('Server listening @ port ' + port);
});


function wsSend(data, puid = null){
    if (puid != null) data.puid = puid;
    ws.send(JSON.stringify(data));
}

function processMsg(ws_msg){
    var json = JSON.parse(ws_msg);

    //do something
    switch (json.cmd) {
        case 'hello from client :)':
        wsSend({msg: 'hi from server :D'}, json.puid); //just a test
        break;

        case 'waitFor':
        setTimeout(() => {
            wsSend({msg: 'Delayed for ' + json.delay + ' ms'}, json.puid);
        }, json.delay);
        break;

        default:
            break;
    }
}