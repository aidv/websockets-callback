# websockets-callback
WebSocket messages with callbacks.
There's a C++ port of this library called [WebSockets-Callback.CPP](https://github.com/aidv/WebSockets-Callback.CPP)

## NEW IN 0.4.8

Now supports Electron.

### Projects using websockets-callback
- [I2Catalyst](https://github.com/aidv/i2catalyst) - A browser based I2C packet analyzer using NodeJS
- [jobmatch-er](https://github.com/jobmatch-er/jobmatch.er-ws) - We don't know what this project does, but thanks for using WSCB


### Introduction

WSCB's goal is to be the easiest solution to communicate between devices using Websockets.

It contains two main functions: `on()` and `send()`.

It has two types of messages: `Expectations` and `Unexpected`.

Expectations are messages that trigger an `on()` binding on the receiving end of the pipe.

Unexpected messages will trigger a commonly shared function.

### Expectations

An expectation callback has two arguments: `msg` and `respondWith()`.

The `msg` object contains the data that the sender has sent, and `respondWith(obj)` is a function that takes an object as its argument.

The function `respondWith()` is used to reply to the sender, usually used as an ACK signal.

Example:

```js
wscb.on('human', function(msg, respondWith){
    respondWith({human: 'homosapien'});
});
```


### Coding fashion
Firstly, it's important to understand that the file ```wscb.js``` inside the folder ```./lib``` is cross compatible with both NodeJS and the browser (in my case Chrome).

To create a trigger  you call the ```on(object, onHandle)``` function and pass an object (as the message) and specify a handler function.
The handler function is called when the trigger is triggered.
The handler function has two parameters:
    - The message
    - A response function called ```respondWith(object)``` that you call when you want to respond to the message.
      NOTE:
      If the response object contains the key ```progress```, the expectation on the other end of the pipe will not be removed
      and allows for several responses to be sent until you either (A) set the ```progress``` value to ```100``` or respond
      without the ```progress``` key.
    

To send an expectation (*1*) you call the ```send(object, onResponse, onProgress, connection)``` and feed an object (as the message), the response handler, the progress handler and the connection to that should carry the message.

It's also important to note that the connection parameter is only used in NodeJS.
Why is that? Because in NodeJS you're most likely to run a server (although you can create a client too) and so when you want to send an expectation or a responseless message to a client, you also need to define who you're sending it to. Thus the connection parameter has to be defined upon calling the ```send(object, onResponse, onProgress, connection)``` function.

The progress handler is only called when the key ```progress``` exists in the response message.
The ```progress``` value has a range of 0 to 100 where when at 100 (or non-existant) the expectation is deleted 

(*1*) An "expectation" is a message that expects a response. If no response is received, the expectation will wait forever.


#### Using in an Electron app

In your `main.js` add the following:
```js
    const WebSockets_Callback = require('wscb');
    var wscb = new WebSockets_Callback({asElectron: true})

    //follow the rest of the instructions below
```

In your `index.html` add the following in the body:
```js
    <script>
        const WebSockets_Callback = require('wscb.js')
        var wscb = new WebSockets_Callback({asElectron: true, asClient: true})

        //follow the rest of the instructions below
    </script>
```




#### Creating a trigger (cross compatible)
A trigger is triggered when a specified message is received.
Once the trigger shoots and you've handled the message, you can respond to the message by calling ```respondWith()```

```js
wscb.on('human',
    function(msg, respondWith){
        respondWith({human: 'homosapien'});
    }
);
```

#### Sending an expectation

```js
wscb.send(
    {key: 'value', greeting: 'hello world!'},
    function(response){
        
    },
    function(response){
        console.log(response.progress + '% done');
    },
    conn //set to undefined or ignore if sending from the browser
);
```

### To install from npm:
```
npm i wscb
```

### Options:
```js
var options = {
    verbose: false, //will log some messages to the console
    asClient: false, //will setup WSCB as a client. Browser incompatible.
    asElectron:  false, //will use Electron IPC instead of Websockets

    address: '127.0.0.1',
    port: 8081,
    onOpen: undefined,
    onError: undefined,
    onListening: undefined,
    onUnexpectedMessage: undefined
}
```

### NodeJS sample code:
```js
const WebSockets_Callback = require('wscb');


var options = {}

var wscb = new WebSockets_Callback(options);

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

### Browser sample code:
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
    onOpen: function(conn){

    },

    onError: function(conn, error){
    
    },

    onListening: function(){

    }
});
```

Star this repository on github, please. Thank you.
