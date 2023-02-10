const socket = function(url) {
    let ws = null;
    let listenerCallbackFn = (ev) => { console.warn('got stocket event no listener registered')};

    function connect(userId, color, onConnectionEventCallbackFn, listenerFn) {
        console.log(`connecting to [${url}]...`);

        listenerCallbackFn = listenerFn;

        ws = new WebSocket(url);
        ws.onmessage = (event) => {
            listenerCallbackFn(event.data);
        }

        ws.onopen = (event) => {
            onConnectionEventCallbackFn(true);
            listenerCallbackFn(event.data);
            send({ type: 'init', color });
        }

        ws.onclose = (event) => {
            onConnectionEventCallbackFn(false);
            ws = null;
        }
    }

    function disconnect() {
        if (ws != null) {
            ws.close();
        }
    }

    function send(obj) {
        if (ws == null) {
            return;
        }
        const str = JSON.stringify({ name: getUserFieldValue(), ...obj });
        ws.send(str);
    }

    return {
        connect,
        disconnect,
        send,
    }
  }
