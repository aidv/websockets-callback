# websockets-callback
WebSocket messages with callbacks

### To install from npm repository:
```
npm i wscb
```

### Sample NodeJS code compatible with the web demo:
```js
const WebSockets_Callback = require('wscb');
var wscb = new WebSockets_Callback();
//var wscb = new WebSockets_Callback({port: 1234});

wscb.on('hello from client :)', function(msg, respondWith){
    console.log('Client said:')
    console.log(msg)
    respondWith({msg: 'hi from server :D'});
})

wscb.on('waitFor', function(msg, respondWith){
    setTimeout(() => {
        respondWith({msg: 'Delayed for ' + msg.delay + ' ms'});
    }, msg.delay);
    
})

wscb.on('progress', function(msg, respondWith){
    var progress = -1;
    var progressTimer = setInterval(() => {
        progress++;
        if (progress >= 100){
            progress = 100;
            clearInterval(progressTimer);
        }
        respondWith({progress: progress});
    }, 10);
})
```

### Additional Information

You can access the underlying WebSocket onConnect/onMessage/onError events by passing functions during construction:
```js
const WebSockets_Callback = require('wscb');
var wscb = new WebSockets_Callback({
    onConnection: function(conn){

    },

    onError: function(conn, error){
        //This will 
    },

    onListening: function(){

    }
});

```

Star this repository on github, please. Thank you
