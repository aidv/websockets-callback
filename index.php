<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <title>Websockets Callback Demo</title>
        <script type="text/javascript" src="websockets_callback.js"></script>
    </head>
    <body>
        <input id="callbackDelay" type="number" value="3000">milliseconds
        <br>
        <button onclick="onSendClick()">Send delayed callback</button>
        <br>
        <br>
        <div>
            Server Response:
            <div id="ws_response"></div>
        </div>

        <script>
            var wsc = new websockets_callback(
                {
                    address: '192.168.0.103',
                    onOpen: function(){
                        console.log('Connected to websocket server!')
                    }
                }
            );

            function onSendClick(){
                var milliseconds = document.getElementById("callbackDelay").value;

                //magic starts here
                wsc.send({cmd: 'waitFor', delay: milliseconds},
                    function(response){
                        document.getElementById("ws_response").innerHTML = response.msg;
                    }
                )
            }
        </script>
    </body>
</html>
