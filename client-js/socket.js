const socket = function(url) {
    let ws = null;

    function connect() {
        console.log(`connecting to [${url}]...`);

        ws = new WebSocket(url);
        ws.onmessage = (event) => {
            gotData(event.data);
        }

        ws.onopen = (event) => {
            setConnected(true);
            sendData({ user: getUserFieldValue() });
        }

        ws.onclose = (event) => {
            setConnected(false);
        }
    }

    function disconnect() {
        if (ws != null) {
            ws.close();
        }
        setConnected(false);
    }

    function send(obj) {
        const str = JSON.stringify(obj);
        ws.send(str);
    }

    return {
        connect,
        disconnect,
        send
    }
  }
