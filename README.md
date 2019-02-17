Client and server code that allows you to make WebSocket calls with callbacks.

Each call is assigned a unique ID that is used by the server once it has processed the call.

Once the server has processed the client message it returns a response with the unique call ID that the client can use call the appropriate callback.

This is simplifies your code A LOT if you do many websocket calls and/or do a lot of server-side processing.

Data flow:
client -> request (data + uid) -> server -> processing -> response (data + uid) -> client
