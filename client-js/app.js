const url = 'ws://localhost:8080/collab';
const collaborators = new Map();
const sock = socket(url);

let logArea = null;
let userIdField = null;
let messageField = null;

function handleInit(obj) {
    const domCursorTemplate = getCursor();
    const domCursor = domCursorTemplate.cloneNode(true);

    collaborators.set(
        obj.name,
        {
            name: obj.name,
            color: obj.color,
            domCursor
        }
    );
    domCursor.style.display = 'block';
    domCursor.id = 'cursor-' + obj.name;

    const domCursorLabel = domCursor.querySelector('#cursor-label');
    domCursorLabel.style.backgroundColor = obj.color;
    domCursorLabel.innerText = obj.name;

    const domCursorArrow = domCursor.querySelector('#cursor-arrow');
    domCursorArrow.setAttribute('fill', obj.color);

    document.body.appendChild(domCursor);
}

function handleMouseMove(obj) {
    if (obj.hasOwnProperty('mx') && obj.hasOwnProperty('my')) {

        const collaborator = collaborators.get(obj.name);
        if (collaborator) {
            const x = obj.mx;
            const y = obj.my;
            console.log(`updateCursorPos [${obj.name}] - [${x}, ${y}]`);
            collaborator.domCursor.style.transform = `translate(${x}px, ${y}px)`;
        } else {
            console.warn('Collaborator with name [' + obj.name + '] NOT found');
        }
    }
}

function gotData(msg) {
    // debugger;
    if (isString(msg)) {
        try {
            obj = JSON.parse(msg);
            textArea.value += msg + '\n';

            if (obj.hasOwnProperty('type') && obj.hasOwnProperty('name')) {
                if (obj.name == getUserFieldValue()) {
                    return;
                }

                switch(obj.type) {
                    case 'init':
                        handleInit(obj);
                        break;

                    case 'mousemove':
                        handleMouseMove(obj);
                        break;
                }
            }

        } catch (e) {
            console.error(e);
        }
    }
}

function sendMousePos(x, y) {
    sock.send({ type: 'mousemove', mx: x, my: y});
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

function setup() {
    const btnConnect = document.getElementById('connect');
    btnConnect.addEventListener('click', () => {
        const userId = getUserFieldValue();
        if (!userId) {
            focusOnUserId();
            alert('Unable to continue. No userId set');
            return;
        }
        const colorField = document.getElementById('userColorField');
        sock.connect(userId, colorField.value, setConnected, gotData);
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

    document.addEventListener('mousemove', (event) => {
        const x = event.clientX;
        const y = event.clientY;
        // console.log(`mousemove [${x}, ${y}]`);
        sendMousePos(x, y);
    });
}

setup();

// setTimeout(() => {
//     updateCursorPos(100, 100);
// }, 3000);
