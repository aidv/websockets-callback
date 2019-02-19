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