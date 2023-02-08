// Field: UserId
function getUserIdField() {
    const field = document.getElementById('userIdField');
    return field;
}

function getUserFieldValue() {
    const field = getUserIdField();
    return field.value;
}

function focusOnUserId() {
    const field = getUserIdField();
    field.focus();
}

// Title

function getTitleEl() {
    const el = document.getElementById('title');
    return el;
}

function getTitle() {
    const el = getTitleEl();
    return el.innerText;
}

function setTitle(text) {
    const el = getTitleEl();
    el.innerText = text;
}
