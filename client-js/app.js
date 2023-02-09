const url = 'ws://localhost:8080/collab';

const sock = socket(url);

let logArea = null;
let userIdField = null;
let messageField = null;

function sendData(obj) {
    console.log('sendData');

}

function gotData(obj) {
   textArea.value += JSON.stringify(obj) + '\n';
}

function setConnected(isConnected) {
    const title = getTitleEl();
    if (isConnected) {
        console.log('connected...');
        setTitle('WebSocket Client - CONNECTED');
    } else {
        setTitle('WebSocket Client - DISCONNECTED');
        console.log('disconnected...');
    }
}

(function() {
    const btnConnect = document.getElementById('connect');
    btnConnect.addEventListener('click', () => {
        const userId = getUserFieldValue();
        if (!userId) {
            focusOnUserId();
            alert('Unable to continue. No userId set');
            return;
        }
        sock.connect(setConnected, gotData);
    });

    const btnDisconnect = document.getElementById('disconnect');
    btnDisconnect.addEventListener('click', () => {
        sock.disconnect();
    });

    const btnSend = document.getElementById('send');
    btnSend.addEventListener('click', () => {
        const text = textField.value;
        sock.send(text);
    });

    textArea = document.getElementById('logArea');
    messageField = document.getElementById('messageField');

    messageField.addEventListener("focus", () => {
        sock.send({ field: 'messageField', event: 'focus' });
    });

    messageField.addEventListener("blur", () => {
        sock.send({ field: 'messageField', event:  'blur' });
    });

})();








