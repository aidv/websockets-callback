# websockets-callback
WebSocket messages with callbacks

### To install from npm:
```
npm i wscb
```

### NodeJS sample code:
```js
const WebSockets_Callback = require('wscb');
var wscb = new WebSockets_Callback();

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

wscb.options.onUnexpectedMessage = function(conn, msg){
    console.log('Client sent a responseless message: ' + msg)
}


//wait for client to connect
wscb.options.onOpen = function(conn){
    console.log('Client connected')
    //Send some tests to client and wait for responses
    console.log('Sending waitFor test (3000 ms)...')
    wscb.send({cmd: 'waitFor', delay: 3000},
        function(response){
            console.log(response.msg);

            setTimeout(progressTest, 2000);
        },
        undefined, //not expecting any progress
        conn
    )

    function progressTest(){
        wscb.send({cmd: 'progress'},
            function(response){
                console.log('Progress test completed!');
            },
            function(response){
                console.log(response.progress + '% done');
            },
            conn
        )
    }
}
```

### NodeJS sample code:
```html
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <title>Websockets Callback Demo</title>
        <script type="text/javascript" src="wscb.js"></script>
    </head>
    <body>
        <input id="callbackDelay" type="number" value="3000">milliseconds
        <br>
        <button onclick="onSendClick()">Send delayed callback</button>
        <br>
        <br>
        <button onclick="onTestProgressClick()">Test progress</button>
        <br>
        <progress id="progressBar" value="0" max="100"></progress>
        <br>
        <br>

        <div>
            Server Response:
            <div id="ws_response"></div>
        </div>

        <script>
            var wscb = new WebSockets_Callback(
                {
                    address: '192.168.1.5',
                    onOpen: function(){
                        console.log('Connected to websocket server!')
                    }
                }
            );

            function onSendClick(){
                var milliseconds = document.getElementById("callbackDelay").value;

                //magic starts here
                wscb.send({cmd: 'waitFor', delay: milliseconds},
                    function(response){
                        document.getElementById("ws_response").innerHTML = response.msg;
                    }
                )
            }

            function onTestProgressClick(){
                //magic starts here
                wscb.send({cmd: 'progress'},
                    function(response){
                        document.getElementById("ws_response").innerHTML = 'Progress test completed!';
                    },

                    function(response){
                        document.getElementById("progressBar").value = response.progress;
                    }
                )
            }


            //create a few expectations
            wscb.on('hello from server :)', function(msg, respondWith){
                document.getElementById("ws_response").innerHTML = 'Server said: ' + JSON.stringify(msg);
                    
                console.log('Server said:')
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

            wscb.options.onUnexpectedMessage = function(conn, msg){
                console.log('Client sent a responseless message: ' + msg)
            }
        </script>
    </body>
</html>
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
